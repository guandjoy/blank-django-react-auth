import React, { useState, useEffect, useMemo } from "react";
import { css, cx } from "linaria";
import { morphing } from "primitivo-svg";

export const center = css`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
`;

export const bottom = css`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto auto 128px auto;
  transition: transform 0.8s, margin-bottom 0.8s;
  animation-name: appearance;
  animation-duration: 1s;

  @keyframes appearance {
    from {
      margin-bottom: 0;
      transform: translateY(100%);
    }
    to {
      margin-bottom: 128px;
      transform: translateY(0);
    }
  }
`;

// Spinner size
export const big = css`
  width: 128px;
  height: 128px;
`;
export const middle = css`
  width: 64px;
  height: 64px;
`;
export const small = css`
  width: 32px;
  height: 32px;
`;

export const wrapper = css`
  z-index: 4;
  text-align: center;

  & span {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    height: 16px;
    /* outline: 1px solid red; */
    font-size: 0.875rem;
    color: black;
  }

  & svg {
    width: 100%;
    height: 100%;
  }

  & path {
    stroke-width: 3;
    fill: transparent;
    mix-blend-mode: multiply;
  }
`;

function Spinner(props) {
  const [width, setWidth] = useState(128);
  const [height, setHeight] = useState(128);
  const [pathsVisibility, setPathVisibility] = useState([]);

  const durPerPath = props.duration / (props.numOfKeyPaths * 2 - 1);
  const numOfColors = props.colors.length;
  const animateColorDuration =
    numOfColors * durPerPath - props.shiftStep * props.numOfShapes + "ms";

  useEffect(() => {
    setPathVisibility(() => {
      var proto = [];
      for (let i = 0; i < props.numOfShapes; i++) {
        proto[i] = setTimeout(() => true, props.shiftStep * i);
      }
      return proto;
    });
  }, []);

  const morphParams = {
    numOfKeyPaths: props.numOfKeyPaths,
    loop: true
  };
  var keySplines = [];
  var keyTimes = [];
  var numOfKeyTimes = morphParams.numOfKeyPaths * 2 - 2;
  var keyTimesFactor = 1 / numOfKeyTimes;
  for (let i = 0; i < morphParams.numOfKeyPaths * 2 - 1; i++) {
    keyTimes[i] = i * keyTimesFactor;
  }
  for (let i = 0; i < morphParams.numOfKeyPaths * 2 - 2; i++) {
    keySplines[i] = "0.25 0 0.75 1";
  }
  keySplines = keySplines.join(";");
  keyTimes = keyTimes.join(";");

  const pathParams = {
    numOfSegments: props.numOfPathSegments,
    depth: 0,
    x: 0,
    y: 0,
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    rotate: [0, 90],
    numOfGroups: 1,
    groups: [
      {
        type: "radial",
        incircle: true,
        round: props.round,
        distance: [1 - props.contrast, 1]
      }
    ]
  };
  const blob = useMemo(() => morphing(morphParams, pathParams), []);

  const animateColorValues = props.colors.join(";");
  const animatePathDuration = props.duration + "ms";
  var paths = [];
  for (let i = 0; i < props.numOfShapes; i++) {
    paths.push(
      pathsVisibility[i] && (
        <path key={i} fill="#3688FF" opacity="1">
          <animate
            begin={props.shiftStep * i + "ms"}
            attributeName="opacity"
            dur="200ms"
            repeatCount="1"
            from="0"
            to="1"
          />
          <animate
            begin={props.shiftStep * i + "ms"}
            attributeName="d"
            dur={animatePathDuration}
            repeatCount="indefinite"
            calcMode="linear"
            keyTimes={keyTimes}
            keySplines={keySplines}
            values={blob.dValues}
          />
          {props.fillTransition && (
            <animate
              begin={props.shiftStep * i + "ms"}
              attributeName="fill"
              values={animateColorValues}
              dur={animateColorDuration}
              repeatCount="indefinite"
            />
          )}
          {props.strokeTransition && (
            <animate
              begin={props.shiftStep * i + "ms"}
              attributeName="stroke"
              values={animateColorValues}
              dur={animateColorDuration}
              repeatCount="indefinite"
            />
          )}
        </path>
      )
    );
  }

  return (
    <div className={cx(wrapper, eval(props.type), eval(props.size))}>
      <svg viewBox={`0 0 ${width} ${height}`}>{paths}</svg>
      {props.lable && <span>{props.lable}</span>}
    </div>
  );
}

Spinner.defaultProps = {
  type: "center",
  size: "big",
  duration: 4000,
  shiftStep: 120,
  numOfKeyPaths: 8,
  numOfShapes: 3,
  colors: ["#3688FF", "#FF546C", "#22D163", "#3688FF"],
  contrast: 0.8,
  round: 0.6,
  numOfPathSegments: 6,
  fillTransition: true,
  strokeTransition: true,
  lable: false
};

export default Spinner;