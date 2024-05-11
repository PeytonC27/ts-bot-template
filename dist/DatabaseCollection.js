"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const result = require('dotenv').config();
/**
 * A database collection class designed to make insertion, deletion, updating, and getting operations easier
 * with a wrapper class. This class can be used alone, but it's advised to make another wrapper around this class
 * when dealing with your own custom objects. (ie, a PlayerDatabaseCollection, or an ImageDatabaseCollection) for
 * more defined data validations.
 *
 * @author Peyton Crua
 */
class DatabaseCollection {
    url;
    databaseName;
    collectionName;
    client;
    database;
    collection;
    /**
     * Creates a database connection to a collection
     * @param connectionString the connection string
     * @param databaseName the name of the database to access
     * @param collectionName the name of the collection to access
     * @param insertionValidation a validation function when inserting data (in case specific data shouldn't be inserted)
     */
    constructor(connectionString, databaseName, collectionName) {
        this.url = connectionString;
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.client = new mongodb_1.MongoClient(this.url);
        this.database = this.client.db(this.databaseName);
        this.collection = this.database.collection(this.collectionName);
    }
    /**
     * Starts the connection with the database
     */
    async connect() {
        if (this.client == null || this.url == null) {
            console.error("Client or URL not set");
            return;
        }
        try {
            if (this.database == null || this.collection == null)
                throw Error("Invalid database and/or collection");
            console.log(`Connected to MongoDB, Database: "${this.databaseName}", Collection: "${this.collectionName}"`);
            await this.client.connect();
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
    /**
     * Adds a new document to the database
     * @param data the data to add
     */
    async insert(data) {
        try {
            await this.collection.insertOne(data);
            //console.log(`Data inserted into ${this.databaseName}, ${this.collectionName}`);
        }
        catch (error) {
            console.error(`Could not insert data into ${this.databaseName}, ${this.collectionName}`);
        }
    }
    /**
     * Updates a document in the database
     * @param databaseName the database to use
     * @param collectionName the collection to use
     * @param filter the condition for selecting documents
     * @param query the modifications to apply to the document
     */
    async update(filter, query) {
        try {
            const result = await this.collection.updateOne(filter, query);
            //console.log(`Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s)`);
        }
        catch (error) {
            console.error(`Error updating documents in ${this.databaseName}, ${this.collectionName}:`);
        }
    }
    /**
     * Gets an array of documents from the database
     * @param databaseName the database to use
     * @param collectionName the collection to use
     * @param query the condition for selecting documents
     */
    async get(query) {
        try {
            const arr = await this.collection.find(query, { projection: { _id: 0 } }).toArray();
            //console.log(arr);
            return arr;
        }
        catch (error) {
            console.error(`Could not find data with query "${query}" in ${this.databaseName}, ${this.collectionName}`);
            return [];
        }
    }
    /**
     * Gets an array of documents from the database
     * @param databaseName the database to use
     * @param collectionName the collection to use
     * @param query the condition for selecting documents
     */
    async getOne(query) {
        try {
            const o = await this.collection.findOne(query, { projection: { _id: 0 } });
            return o;
        }
        catch (error) {
            console.error(`Could not find data with query "${query}" in ${this.databaseName}, ${this.collectionName}`);
            return null;
        }
    }
    /**
     * Removes a document from the database
     * @param databaseName the database to use
     * @param collectionName the collection to use
     * @param filter the condtion for selecting documents
     */
    async remove(filter) {
        try {
            const result = await this.collection.deleteOne(filter);
            //console.log(`Deleted ${result.deletedCount} document(s)`);
        }
        catch (error) {
            console.error(`Error removing documents from ${this.databaseName}, ${this.collectionName}:`);
        }
    }
    /**
     * Ends connection with the database
     */
    async close() {
        await this.client.close();
        console.log('Connection to MongoDB closed');
    }
}
exports.default = DatabaseCollection;
