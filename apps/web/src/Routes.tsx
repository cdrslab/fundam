import type { ElementType } from 'react';
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { useRoutes } from 'react-router';

const pathNames = {
  list_base_page: '/list_base_page',
  list: '/list',
  base_form: '/base_form',
  list_pro: '/list_pro',
} as const;

const Loadable = (Component: ElementType) => {
  return (props: any) => {
    return (
      <Suspense fallback={<h1>Loading...</h1>}>
        <Component {...props} />
      </Suspense>
    );
  };
};

const ListBasePage = Loadable(
  lazy(() => {
    return import('./examples/list_base_page')
  }),
)

const List = Loadable(
  lazy(() => {
    return import('./examples/list_page/List')
  }),
)

const BaseForm = Loadable(
  lazy(() => {
    return import('./examples/form_page/BaseForm')
  }),
)

const ListPro = Loadable(
  lazy(() => {
    return import('./examples/list_pro')
  }),
)

const lazyRoutes: RouteObject[] = [
  {
    path: pathNames.list_base_page,
    element: <ListBasePage />,
  },
  {
    path: pathNames.list,
    element: <List />,
  },
  {
    path: pathNames.base_form,
    element: <BaseForm />,
  },
  {
    path: pathNames.list_pro,
    element: <ListPro />,
  },
  // {
  //   path: '*',
  //   element: <ListPro />,
  // },
];

const LazyRoutes = () => {
  const contents = useRoutes(lazyRoutes);
  return <>{contents}</>;
};

export default LazyRoutes;
