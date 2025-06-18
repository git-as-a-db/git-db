/**
 * XMLFormat - Handles XML data format
 */

class XMLFormat {
  constructor(options = {}) {
    this.rootName = options.rootName || 'database';
    this.itemName = options.itemName || 'item';
    this.collectionName = options.collectionName || 'collection';
    this.xml2js = null;
  }

  /**
   * Initialize XML format
   */
  async initialize() {
    try {
      this.xml2js = require('xml2js');
    } catch (error) {
      throw new Error('XML parsing requires xml2js package');
    }
  }

  /**
   * Parse XML data
   */
  async parse(data) {
    if (!this.xml2js) {
      throw new Error('XML format not initialized');
    }

    try {
      const parser = new this.xml2js.Parser();
      const result = await parser.parseStringPromise(data);
      return this.xmlToData(result);
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }

  /**
   * Convert XML to data structure
   */
  xmlToData(xmlObj) {
    const data = {};
    
    if (xmlObj[this.rootName] && xmlObj[this.rootName][this.collectionName + 's']) {
      xmlObj[this.rootName][this.collectionName + 's'].forEach(collection => {
        const collectionName = collection.$.name;
        data[collectionName] = collection[this.itemName] || [];
      });
    }
    
    return data;
  }

  /**
   * Serialize data to XML
   */
  serialize(data) {
    if (!this.xml2js) {
      throw new Error('XML format not initialized');
    }

    try {
      const builder = new this.xml2js.Builder({
        rootName: this.rootName,
        itemName: this.itemName,
        collectionName: this.collectionName
      });
      
      const xmlObj = this.dataToXML(data);
      return builder.buildObject(xmlObj);
    } catch (error) {
      throw new Error(`Failed to serialize XML: ${error.message}`);
    }
  }

  /**
   * Convert data structure to XML
   */
  dataToXML(data) {
    const collections = [];
    
    Object.entries(data).forEach(([collectionName, items]) => {
      collections.push({
        $: { name: collectionName },
        [this.itemName]: items
      });
    });
    
    return {
      [this.rootName]: {
        [this.collectionName + 's']: collections
      }
    };
  }

  /**
   * Get empty data structure
   */
  getEmptyStructure() {
    return { [this.rootName]: { [this.collectionName + 's']: [] } };
  }

  /**
   * Get format configuration
   */
  getConfig() {
    return {
      rootName: this.rootName,
      itemName: this.itemName,
      collectionName: this.collectionName
    };
  }
}

module.exports = XMLFormat; 