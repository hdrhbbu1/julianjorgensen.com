let parseItemData = require('./utils/parseItemData');

let getItem = function(id, itemType) {
  return new Promise(function(resolve, reject) {
    console.log('getting item details for type', itemType);
    if (itemType === 'estimate') {
      // estimate
      qbo.getEstimate(id, (err, estimate) => {
        if (err) reject(err);
        console.log('err', JSON.stringify(err));
        console.log('got estimate', estimate);
        parseItemData(estimate, itemType).then((parsedData) => {
          console.log('parsedData from getItem.js', parsedData);
          resolve(parsedData);
        }).catch((err) => {
          reject(err);
        });
      });
    } else {
      // invoice
      qbo.getInvoice(id, (err, invoice) => {
        parseItemData(invoice, itemType).then((parsedData) => {
          resolve(parsedData);
        }).catch((err) => {
          reject(err);
        });
      });
    }
  });
};

module.exports = getItem;