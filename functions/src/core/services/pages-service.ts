// PageService.ts
import * as admin from 'firebase-admin';
import { z } from 'zod';
import pageSchema, { Page } from '../data/page'; // Adjust import path as needed

class PageService {
  private static collection() {
    return admin.firestore().collection('pages');
  }

  static async createPage(pageData: any, uid: string): Promise<FirebaseFirestore.DocumentReference | null> {
    try {
      // Validate page data against the schema
      const validatedPage: Page = pageSchema.parse({
        ...pageData,
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

  static async getPage(id: string): Promise<Page | null> {
    const pageDoc = await this.collection().doc(id).get();

    if (!pageDoc.exists) {
      return null;
    }

    const pageData = pageDoc.data() as Omit<Page, 'createdAt'> & { createdAt?: admin.firestore.Timestamp }; // Adjusting the type for Firestore data
    const validatedPage = pageSchema.parse({
      ...pageData,
      createdAt: pageData.createdAt?.toDate(), // Convert Firestore Timestamp to Date
    });

    return validatedPage;
  }
}

export default PageService;