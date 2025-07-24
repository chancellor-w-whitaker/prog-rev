import { useCallback, useEffect, useState, useRef } from "react";

export const MyDropdown = ({
  children = "Dropdown button",
  variant = "secondary",
  items = [],
}) => {
  const { popover, isOpen, open } = usePopover();

  return (
    <div className="dropdown">
      <button
        className={[`btn btn-${variant} dropdown-toggle`, isOpen && "active"]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {children}
      </button>
      {isOpen && (
        <ul
          className="dropdown-menu show overflow-y-scroll"
          style={{ maxHeight: 210 }}
          ref={popover}
        >
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = (event) => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(event.target);
    };

    document.addEventListener("mousedown", validateEventStart);
    document.addEventListener("touchstart", validateEventStart);
    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("mousedown", validateEventStart);
      document.removeEventListener("touchstart", validateEventStart);
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};

const usePopover = () => {
  const popover = useRef();

  const [isOpen, toggle] = useState(false);

  const open = useCallback(() => toggle(true), []);

  const close = useCallback(() => toggle(false), []);

  useClickOutside(popover, close);

  return { popover, isOpen, open };
};

export const MyDropdownItem = ({
  defaultClassName = "dropdown-item",
  children = "Action",
  type = "button",
  className = "",
  active = false,
  as = "button",
  ...rest
}) => {
  const As = as;

  return (
    <As
      className={[defaultClassName, className, active && "active"]
        .filter((element) => element)
        .join(" ")}
      type={type}
      {...rest}
    >
      ‎{children}
    </As>
  );
};
