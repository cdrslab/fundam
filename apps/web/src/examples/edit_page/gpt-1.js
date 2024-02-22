import { useContext, useEffect } from 'react';
import { Form } from 'antd';
import { componentsProps } from 'path/to/your/componentsProps';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

// Contexts for tracking the nearest form and component schema
const FormContext = React.createContext(null);
const SchemaContext = React.createContext(null);

// useField hook
export function useField(componentId) {
  const componentProps = componentsProps[componentId] || observable({});

  const setField = (field, value) => {
    componentProps[field] = value;
  };

  return [componentProps, setField];
}

// useSchema hook
export function useSchema(componentId) {
  const schema = useContext(SchemaContext) || {};
  const specificSchema = schema[componentId] || {};

  const setSchema = (field, value) => {
    specificSchema[field] = value;
  };

  return [specificSchema, setSchema];
}

// useForm hook
export function useForm(componentId) {
  const form = useContext(FormContext) || Form.useForm()[0];
  // Assuming that the form context value is the instance of the form
  const specificForm = form[componentId] || form;

  return specificForm;
}

// Example of a form item component using useForm
const FormItemComponent = observer(({ componentId }) => {
  const form = useForm(componentId);

  // rest of the component implementation

  return (
    // JSX using form
  );
});

// Example of a component using useField
const SomeComponent = observer(({ componentId }) => {
  const [props, setProps] = useField(componentId);

  // rest of the component implementation

  return (
    // JSX using props and setProps
  );
});

// Example of a component using useSchema
const SchemaComponent = observer(({ componentId }) => {
  const [schema, setSchema] = useSchema(componentId);

  // rest of the component implementation

  return (
    // JSX using schema and setSchema
  );
});
