import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { z } from 'zod';
import itemSchema, { Item } from '../data/item'; // Adjust the path as needed

class ItemService {
  private static collection() {
    return admin.firestore().collection('items');
  }

  static async createItem(itemData: any, uid: string): Promise<FirebaseFirestore.DocumentReference | null> {
    try {
      // Validate item data against the schema
      const validatedItem: Item = itemSchema.parse({
        ...itemData,
        author: uid,
        createdAt: new Date(),
      });

      const itemRef = await this.collection().add({
        ...validatedItem,
      });

      return itemRef;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Validation errors:', error.errors);
      } else {
        logger.error('createItem errors:', error);
      }

      return null;
    }
  }

  // Get an item by ID (Read)
  static async getItem(id: string): Promise<Item | null> {
    try {
      const itemDoc = await this.collection().doc(id).get();

      if (!itemDoc.exists) {
        return null;
      }

      const itemData = itemDoc.data() as Omit<Item, 'createdAt'> & { createdAt?: admin.firestore.Timestamp };
      const validatedItem = itemSchema.parse({
        ...itemData,
        createdAt: itemData.createdAt?.toDate(), // Convert Firestore Timestamp to Date
      });

      return validatedItem;
    } catch (error) {
      logger.error('getItem errors:', error);
      return null;
    }
  }

  // Update an item by ID
  static async updateItem(id: string, updateData: Partial<Item>): Promise<boolean> {
    try {
      // Validate the update data
      const validatedData = itemSchema.partial().parse(updateData);

      await this.collection().doc(id).update({
        ...validatedData,
        updatedAt: new Date(), // Optional: Track the update timestamp
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Validation errors:', error.errors);
      } else {
        logger.error('updateItem errors:', error);
      }

      return false;
    }
  }

  // Delete an item by ID
  static async deleteItem(id: string): Promise<boolean> {
    try {
      await this.collection().doc(id).delete();
      return true;
    } catch (error) {
      logger.error('deleteItem errors:', error);
      return false;
    }
  }

  // Get all items with optional filters, pagination
  static async getAllItems(
    filters: { author?: string; type?: string; status?: string },
    pageSize: number = 50,
    startAfterId?: string // Optional ID for pagination
  ): Promise<(Item & { id: string })[] | null> {
    try {
      let query: FirebaseFirestore.Query = this.collection();

      // Apply filters if they exist
      if (filters.author) {
        query = query.where('author', '==', filters.author);
      }
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      // Sort by createdAt in descending order
      query = query.orderBy('createdAt', 'desc');

      // If startAfterId is provided, start after the specified document
      if (startAfterId) {
        const lastDoc = await this.collection().doc(startAfterId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Limit results to pageSize
      const snapshot = await query.limit(pageSize).get();

      const items = snapshot.docs.map(doc => {
        const itemData = doc.data() as Omit<Item, 'createdAt'> & { createdAt?: admin.firestore.Timestamp };

        const validatedItem = itemSchema.parse({
          ...itemData,
          createdAt: itemData.createdAt?.toDate(),
        });

        return { ...validatedItem, id: doc.id }; // Return item data along with the ID
      });

      return items;
    } catch (error) {
      logger.error('getAllItems errors:', error);
      return null;
    }
  }
}

export default ItemService;