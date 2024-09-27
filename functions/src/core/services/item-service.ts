// PageService.ts
import * as admin from 'firebase-admin';
import { z } from 'zod';
import itemSchema, { Item } from '../data/item'; // Adjust import path as needed

class ItemService {
  private static collection() {
    return admin.firestore().collection('items');
  }

  static async createItem(itemData: any, uid: string): Promise<FirebaseFirestore.DocumentReference | null> {
    try {
      // Validate page data against the schema
      const validatedPage: Item = itemSchema.parse({
        ...itemData,
        author: uid,
        createdAt: new Date(),
      });

      const pageRef = await this.collection().add({
        ...validatedPage,
      });

      return pageRef;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
      }else {
        console.error('createPage errors:', error);
      }
      
      return null;
    }
  }

  static async getItem(id: string): Promise<Item | null> {
    const itemDoc = await this.collection().doc(id).get();

    if (!itemDoc.exists) {
      return null;
    }

    const itemData = itemDoc.data() as Omit<Item, 'createdAt'> & { createdAt?: admin.firestore.Timestamp }; // Adjusting the type for Firestore data
    const validatedPage = itemSchema.parse({
      ...itemData,
      createdAt: itemData.createdAt?.toDate(), // Convert Firestore Timestamp to Date
    });

    return validatedPage;
  }
}

export default ItemService;