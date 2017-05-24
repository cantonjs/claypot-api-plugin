
import { uniqWith } from 'lodash';

export default function uniqLocations(locations) {
	return uniqWith(locations, (a, b) => a.name === b.name && a.in === b.in);
}
