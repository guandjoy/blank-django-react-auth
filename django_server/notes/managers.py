# based on https://www.revsys.com/tidbits/keeping-django-model-objects-ordered/
from django.db import models, transaction
from django.db.models import F, Max
from django.contrib.auth.models import User

class NoteManager(models.Manager):
    """ Manager to encapsulate bits of business logic """

    def reorder_by(self, field):
        users = User.objects.all()
        for user in users:
            qs = self.get_queryset().filter(owner=user).order_by(field)
            for index, note in enumerate(qs):
                note.order = index + 1
                note.save()

    def remove_order_gaps(self):
        """ Remove all gaps in ordering which somehow occured
        Remove the root cause of this issue """
        users = User.objects.all()
        for user in users:
            qs = self.get_queryset().filter(owner=user).order_by('order')
            for index, note in enumerate(qs):
                print(f'Old order: {note.order}. New order: {index + 1}')
                note.order = index + 1
                note.save()


    def fill_gaps(self, objects):
        """ Pass notes here before delete them """
        qs = self.get_queryset()
        
        with transaction.atomic():
            for obj in objects:
                qs.filter(order__gt=obj.order, owner=obj.owner).update(order=F('order') - 1)


    def move(self, obj, new_order):
        """ Move an object to a new order position """

        qs = self.get_queryset()

        with transaction.atomic():
            if obj.order > int(new_order):
                qs.filter(
                    owner=obj.owner,
                    order__lt=obj.order,
                    order__gte=new_order,
                ).exclude(
                    pk=obj.pk
                ).update(
                    order=F('order') + 1,
                )
            else:
                qs.filter(
                    owner=obj.owner,
                    order__lte=new_order,
                    order__gt=obj.order,
                ).exclude(
                    pk=obj.pk,
                ).update(
                    order=F('order') - 1,
                )

            obj.order = new_order
            obj.save()

    def pin(self, obj):
        # Set pinned to True and set order to the end of pinned notes
        new_order = len(self.filter(owner=obj.owner, pinned=True))
        obj.pinned = True
        obj.save()
        self.move(obj, new_order)

    def unpin(self, obj):
        # Set pinned to False and set order to the beginning of unpinned notes
        new_order = len(self.filter(owner=obj.owner, pinned=True)) - 1
        obj.pinned = False
        obj.save()
        self.move(obj, new_order)



    def create(self, **kwargs):
        instance = self.model(**kwargs)

        with transaction.atomic():
            # Get our current max order number
            results = self.filter(owner=kwargs['owner']).aggregate(Max('order'))
            amount_of_pinned = len(self.filter(owner=kwargs['owner'], pinned=True))

            # Increment and use it for our new object
            current_order = results['order__max'] + 1
            if current_order is None:
                current_order = 0

            value = current_order
            instance.order = value
            instance.save()
            self.move(instance, amount_of_pinned) # move the order to 0

            return instance