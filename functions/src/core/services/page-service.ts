// PageService.ts
import * as admin from 'firebase-admin';
import { logger } from "firebase-functions";
import { z } from 'zod';
import pageSchema, { Page } from '../data/page'; // Adjust import path as needed
import { getOffset } from '../utils/pager';

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
        logger.error('Validation errors:', error.errors);
      }else {
        logger.error('createPage errors:', error);
      }
      
      return null;
    }
  }

  // Get a page by ID (Read)
  static async getPage(id: string): Promise<Page | null> {
    try {
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
    } catch (error) {
      logger.error('getPage errors:', error);
      return null;
    }
  }

  // Update a page by ID
  static async updatePage(id: string, updateData: Partial<Page>): Promise<boolean> {
    try {
      // Validate the update data
      const validatedData = pageSchema.partial().parse(updateData);

      await this.collection().doc(id).update({
        ...validatedData,
        updatedAt: new Date(), // Optional: Track the update timestamp
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Validation errors:', error.errors);
      } else {
        logger.error('updatePage errors:', error);
      }

      return false;
    }
  }

  // Delete a page by ID
  static async deletePage(id: string): Promise<boolean> {
    try {
      await this.collection().doc(id).delete();
      return true;
    } catch (error) {
      logger.error('deletePage errors:', error);
      return false;
    }
  }

  static async getAllPages(
    filters: { author?: string; type?: string; status?: string },
    pageSize: number = 50,
    startAfterId?: string // Optional ID for pagination
  ): Promise<(Page & { id: string })[] | null> {
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
          query = query.startAfter(lastDoc); // Start after the document specified by startAfterId
        }
      }

      // Limit results to pageSize
      const snapshot = await query.limit(pageSize).get();

      const pages = snapshot.docs.map(doc => {
        const pageData = doc.data() as Omit<Page, 'createdAt'> & { createdAt?: admin.firestore.Timestamp };

        // Parse and include the document ID
        const validatedPage = pageSchema.parse({
          ...pageData,
          createdAt: pageData.createdAt?.toDate(),
        });

        return { ...validatedPage, id: doc.id }; // Return page data along with the ID
      });

      return pages;
    } catch (error) {
      console.error('getAllPages errors:', error);
      return null;
    }
  }
}

export default PageService;