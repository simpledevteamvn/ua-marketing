import React, { useRef, useEffect, useContext } from "react";
import { CSSTransition as ReactCSSTransition } from "react-transition-group";

const TransitionContext = React.createContext({
  parent: {},
});

function useIsInitialRender() {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, []);
  return isInitialRender.current;
}

function CSSTransition({
  show,
  enter = "",
  enterStart = "",
  entering = "",
  enterEndDelay,
  enterEnd = "",
  enterTimeout = 100,
  leaveTimeout = 500,
  leave = "",
  leaveStart = "",
  leaveEnd = "",
  appear,
  unmountOnExit,
  tag = "div",
  children,
  ...rest
}) {
  const enterClasses = enter.split(" ").filter((s) => s.length);
  const enteringClasses = entering.split(" ").filter((s) => s.length);
  const enterStartClasses = enterStart.split(" ").filter((s) => s.length);
  const enterEndClasses = enterEnd.split(" ").filter((s) => s.length);
  const leaveClasses = leave.split(" ").filter((s) => s.length);
  const leaveStartClasses = leaveStart.split(" ").filter((s) => s.length);
  const leaveEndClasses = leaveEnd.split(" ").filter((s) => s.length);
  const removeFromDom = unmountOnExit;

  function addClasses(node, classes) {
    classes.length && node.classList.add(...classes);
  }

  function removeClasses(node, classes) {
    classes.length && node.classList.remove(...classes);
  }

  const nodeRef = React.useRef(null);
  const Component = tag;

  return (
    // @ts-ignore
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        // @ts-ignore
        nodeRef.current!.addEventListener("transitionend", done, false);
      }}
      timeout={{ enter: enterTimeout, exit: leaveTimeout }}
      onEnter={() => {
        // @ts-ignore
        if (!removeFromDom) nodeRef.current.style.display = null;
        addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses]);
      }}
      onEntering={() => {
        removeClasses(nodeRef.current, enterStartClasses);

        if (enteringClasses?.length) {
          return addClasses(nodeRef.current, enteringClasses);
        }

        addClasses(nodeRef.current, enterEndClasses);
      }}
      onEntered={() => {
        if (enteringClasses?.length) {
          const getEnterEndClasses = () => {
            removeClasses(nodeRef.current, [
              ...enteringClasses,
              ...enterClasses,
            ]);
            addClasses(nodeRef.current, enterEndClasses);
          };
          if (enterEndDelay) {
            setTimeout(() => {
              getEnterEndClasses();
            }, enterEndDelay);
          } else {
            getEnterEndClasses();
          }
          return;
        }
        removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses]);
      }}
      onExit={() => {
        addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses]);
      }}
      onExiting={() => {
        removeClasses(nodeRef.current, leaveStartClasses);
        addClasses(nodeRef.current, leaveEndClasses);
      }}
      onExited={() => {
        removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses]);
        // @ts-ignore
        if (!removeFromDom) nodeRef.current.style.display = "none";
      }}
    >
      {/* @ts-ignore */}
      <Component
        ref={nodeRef}
        {...rest}
        style={{ display: !removeFromDom ? "none" : null }}
      >
        {children}
      </Component>
    </ReactCSSTransition>
  );
}

function Transition({ show, appear = false, ...rest }) {
  const { parent } = useContext(TransitionContext);
  const isInitialRender = useIsInitialRender();
  const isChild = show === undefined;

  if (isChild) {
    return (
      // @ts-ignore
      <CSSTransition
        // @ts-ignore
        appear={parent.appear || !parent.isInitialRender}
        // @ts-ignore
        show={parent.show}
        {...rest}
      />
    );
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
        },
      }}
    >
      {/* @ts-ignore */}
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  );
}

export default Transition;
