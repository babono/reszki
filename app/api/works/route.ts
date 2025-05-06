import { Client } from "@notionhq/client";
import { NextResponse } from 'next/server';
import type { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints"; // Import Notion types

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DB_ID!;

// Define the structure for a single work item
interface Work {
  id: string; // Use Notion page ID as the unique identifier
  name: string;
  Description: string;
  Gallery: string[];
}

// Helper function to extract plain text from a Notion rich text property
const getPlainText = (richTextData: any): string => {
  if (!Array.isArray(richTextData)) return '';
  return richTextData.map((rt: any) => rt.plain_text).join('') || '';
};

// Helper function to extract file URLs from a Notion files property
const getFileUrls = (filesArray: any[]): string[] => {
  return filesArray?.map((file: any) => {
    if (file.type === 'file') {
      return file.file?.url; // External files hosted by Notion (temporary URLs)
    } else if (file.type === 'external') {
      return file.external?.url; // External URLs you added
    }
    return null;
  }).filter((url): url is string => url !== null) || []; // Filter out nulls and ensure type is string
};

export async function GET() {
  if (!DATABASE_ID || !process.env.NOTION_API_KEY) {
    console.error("Notion API Key or Database ID is missing.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      // Add sorts if needed, e.g., by an 'Order' property or 'Created time'
      sorts: [
        // Example: Sort by a property named 'Order'
        // { property: 'Order', direction: 'ascending' },
        // Fallback sort by creation time if 'Order' doesn't exist or isn't set
        { timestamp: 'created_time', direction: 'descending' }
      ],
      // Add filters if you only want to fetch 'Published' items, for example
      // filter: { property: 'Status', status: { equals: 'Published' } }
    });

    // Initialize arrays for the structured data
    const works: Work[] = [];
    const moreWorks: Work[] = [];

    // Process results and build the Work objects
    for (const page of response.results) {
      // Type guard to ensure we have a full page object, not a partial one
      if (!('properties' in page)) {
        continue;
      }

      // --- Extract data using property names from your Notion DB ---
      // Adjust 'Name', 'Description', 'Gallery', 'isMoreWorks' if your property names differ

      const nameProperty = page.properties.Name; // Assuming 'Name' is the Title property
      const descriptionProperty = page.properties.Description; // Assuming 'Description' is Rich Text
      const galleryProperty = page.properties.Gallery; // Assuming 'Gallery' is Files & Media
      const isMoreWorksProperty = page.properties.isMoreWorks; // Assuming 'isMoreWorks' is Checkbox

      const name = (nameProperty?.type === 'title' ? getPlainText(nameProperty.title) : 'Untitled');
      const description = (descriptionProperty?.type === 'rich_text' ? getPlainText(descriptionProperty.rich_text) : '');
      const galleryUrls = (galleryProperty?.type === 'files' && Array.isArray(galleryProperty.files) ? getFileUrls(galleryProperty.files) : []);
      const isMore = isMoreWorksProperty?.type === 'checkbox' ? isMoreWorksProperty.checkbox : false;
      // --- End data extraction ---

      // Basic validation: Ensure at least a name exists
      if (!name) {
        console.warn(`Page ${page.id} skipped because it has no title.`);
        continue;
      }

      const workItem: Work = {
        id: page.id, // Use Notion's page ID
        name: name,
        Description: description,
        Gallery: galleryUrls,
      };

      if (isMore) {
        moreWorks.push(workItem);
      } else {
        works.push(workItem);
      }
    }

    return NextResponse.json({ works, moreWorks });

  } catch (error: any) {
    console.error("Error fetching from Notion:", error);
    const errorMessage = error.body ? JSON.parse(error.body).message : 'Failed to fetch data from Notion';
    return NextResponse.json({ error: errorMessage }, { status: error.status || 500 });
  }
}