import { Client } from "@notionhq/client";
import { NextResponse } from 'next/server';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
// Ensure NOTION_API_KEY is set in your .env.local file

// Replace with your actual Database ID
const DATABASE_ID = process.env.NOTION_DB_ID!;
// Ensure NOTION_DB_ID is set in your .env.local file

// Helper function to extract title (adjust property name if needed)
const getTitle = (page: any): string | null => {
  // Adjust 'Name' if your title property has a different name
  const titleProperty = page.properties.Name;
  if (titleProperty?.type === 'title' && titleProperty.title?.[0]?.plain_text) {
    return titleProperty.title[0].plain_text;
  }
  return null;
};

export async function GET() {
  try {
    // Fetch all relevant pages from the database
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      // Add sorts if needed, e.g., by an 'Order' property
      // sorts: [{ property: 'Order', direction: 'ascending' }],
      // You could potentially filter here if needed, but we'll filter in code
      // filter: { property: 'Status', status: { equals: 'Published' } } // Example filter
    });

    const works: string[] = [];
    const moreWorks: string[] = [];

    // Process results and filter based on the checkbox
    response.results.forEach((page: any) => {
      const title = getTitle(page);
      if (!title) return; // Skip if no title

      // Adjust 'isMoreWorks' if your checkbox property has a different name
      const isMoreWorksChecked = page.properties.isMoreWorks?.checkbox === true;

      if (isMoreWorksChecked) {
        moreWorks.push(title);
      } else {
        works.push(title);
      }
    });

    return NextResponse.json({ works, moreWorks });

  } catch (error: any) {
    console.error("Error fetching from Notion:", error);
    // Provide more specific error info if available
    const errorMessage = error.body ? JSON.parse(error.body).message : 'Failed to fetch data from Notion';
    return NextResponse.json({ error: errorMessage }, { status: error.status || 500 });
  }
}