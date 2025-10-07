
'use server';
/**
 * @fileOverview A Genkit flow for retrieving offers from Firestore.
 *
 * This file defines a flow that fetches all documents from the 'offers'
 * collection in Firestore. This provides a secure way to access data
 * from the client-side without exposing direct database access.
 *
 * - getOffers - A function that invokes the offersFlow.
 */

import { ai } from '@/ai/genkit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { z } from 'genkit';

// Define the schema for what an offer looks like.
// This helps with type safety and validation.
const OfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  oldPrice: z.string().optional(),
  newPrice: z.string(),
  imgSrc: z.string(),
  imgHint: z.string().optional(),
  discount: z.string().optional(),
});

// The main flow definition
const offersFlow = ai.defineFlow(
  {
    name: 'offersFlow',
    // No input needed for this flow
    inputSchema: z.undefined(),
    // The output will be an array of offers
    outputSchema: z.array(OfferSchema),
  },
  async () => {
    // IMPORTANT: When using Admin SDKs, Firestore must be initialized
    // within the flow to ensure it runs in the correct server environment.
    const db = getFirestore();
    const offersCol = collection(db, 'offers');
    const offersSnapshot = await getDocs(offersCol);
    const offersList = offersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Validate the output against the schema before returning
    return OfferSchema.array().parse(offersList);
  }
);

/**
 * An exported wrapper function that calls the offersFlow.
 * This is the function that the client-side code will import and use.
 * @returns A promise that resolves to an array of offers.
 */
export async function getOffers() {
  return await offersFlow();
}

    