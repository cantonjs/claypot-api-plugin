
const formatMap = {
	csv: ',',
	ssv: ' ',
	tsv: '\\',
	pipes: '|',
};

export default function formatCollection(collection = '', format = 'csv') {
	if (!formatMap.hasOwnProperty(format)) { format = 'csv'; }
	return (collection + '').split(formatMap[format]);
}
