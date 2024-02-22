import React, { useState, useEffect, useRef } from 'react';

// Dynamic Input component
const Input = ({ id, componentRef }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (componentRef && inputRef.current) {
      componentRef.current = {
        get visible() {
          return !inputRef.current.hidden;
        },
        set visible(value) {
          inputRef.current.hidden = !value;
        },
        get tooltip() {
          return inputRef.current.getAttribute('title');
        },
        set tooltip(value) {
          inputRef.current.setAttribute('title', value);
        },
        // ... other dynamic props can be added here
      };
    }
  }, [componentRef]);

  return <input ref={inputRef} />;
};

// Fundam component
const Fundam = ({ data, method, schema }) => {
  const [stateData, setStateData] = useState(data);
  const componentsRef = useRef({});

  const context = {
    get data() {
      return stateData;
    },
    set data(value) {
      setStateData(value);
    },
    get method() {
      return method;
    },
    get component() {
      return componentsRef.current;
    },
    api: {
      // Mock API method
      getResourceType: async () => {
        // Simulate fetching data
        return Promise.resolve({ xxx: true });
      },
    },
  };

  // Bind methods to the context
  for (const methodName in method) {
    method[methodName] = method[methodName].bind(context);
  }

  // Lifecycle methods
  useEffect(() => {
    method.onMount?.();
    return () => {
      method.onUnmount?.();
    };
  }, []);

  // Traverse the schema to render components recursively
  const renderComponent = (componentSchema) => {
    if (!componentSchema) return null;

    const { id, children, ...rest } = componentSchema;

    // Create a ref for each component
    if (id && !componentsRef.current[id]) {
      componentsRef.current[id] = React.createRef();
    }

    let Component;
    switch (rest.type) {
      case 'Input':
        Component = Input;
        break;
      // Add cases for other component types as needed
      default:
        // Default to a div for unknown types
        Component = 'div';
        break;
    }

    const props = { ...rest.props, id, componentRef: componentsRef.current[id] };

    return (
      <Component {...props}>
        {children && Object.values(children).map(renderComponent)}
      </Component>
    );
  };

  return renderComponent(schema);
};

export default () => {
  return <Fundam data={data} method={method} schema={schema} />;
};
