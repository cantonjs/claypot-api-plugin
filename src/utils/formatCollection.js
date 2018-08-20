const formatMap = {
	csv: ',',
	ssv: ' ',
	tsv: '\\',
	pipes: '|',
};

export default function formatCollection(collection, format = 'csv') {
	if (!collection) return [];
	if (!formatMap.hasOwnProperty(format)) format = 'csv';
	return collection.toString().split(formatMap[format]);
}
