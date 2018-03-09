// yarn add enzyme enzyme-adapter-react-16 react-test-renderer
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });