import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import InstanceList from './InstanceList';
import Instance from './Instance';

describe(InstanceList, () => {
  const component = shallow(
    <InstanceList />
  );

  it('renders and matches our snapshot', () => {
    const component = renderer.create(
      <InstanceList />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Additional tests go here
});