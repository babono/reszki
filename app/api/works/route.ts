import { Client } from "@notionhq/client";
import { NextResponse } from 'next/server';
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  RichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints";
import { isFullPage, APIResponseError } from "@notionhq/client";

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
const getPlainText = (richTextData: Array<RichTextItemResponse>): string => {
  if (!Array.isArray(richTextData)) return '';
  return richTextData.map((rt: RichTextItemResponse) => rt.plain_text).join('') || '';
};

// Helper function to extract file URLs from a Notion files property
type NotionFile = { type: 'file', file?: { url: string }} | { type: 'external', external?: { url: string }};
const getFileUrls = (filesArray: Array<NotionFile>): string[] => { 
  return filesArray?.map((file: NotionFile) => {
    if (file.type === 'file' && file.file) {
      return file.file.url;
    } else if (file.type === 'external' && file.external) {
      return file.external.url;
    }
    return null;
  }).filter((url): url is string => url !== null) || [];
};

export async function GET() {
  if (!DATABASE_ID || !process.env.NOTION_API_KEY) {
    console.error("Notion API Key or Database ID is missing.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        { timestamp: 'created_time', direction: 'descending' }
      ],
    });

    const works: Work[] = [];
    const moreWorks: Work[] = [];

    for (const page of response.results as Array<PageObjectResponse | PartialPageObjectResponse>) {
      if (!isFullPage(page)) {
        console.warn(`Page ${page.id} is partial and was skipped.`);
        continue;
      }

      const nameProperty = page.properties.Name;
      const descriptionProperty = page.properties.Description;
      const galleryProperty = page.properties.Gallery;
      const isMoreWorksProperty = page.properties.isMoreWorks;

      const name = (nameProperty?.type === 'title' ? getPlainText(nameProperty.title) : 'Untitled');
      const description = (descriptionProperty?.type === 'rich_text' ? getPlainText(descriptionProperty.rich_text) : '');
      
      let galleryUrls: string[] = [];
      if (galleryProperty?.type === 'files' && Array.isArray(galleryProperty.files)) {
        // Filter files to ensure 'type' is defined and is either 'file' or 'external'
        const validFiles = galleryProperty.files.filter(
          file => file.type === 'file' || file.type === 'external'
        );
        // Cast to NotionFile[] as the filter ensures the type property matches our definition
        galleryUrls = getFileUrls(validFiles as NotionFile[]);
      }
      
      const isMore = isMoreWorksProperty?.type === 'checkbox' ? isMoreWorksProperty.checkbox : false;

      if (!name) {
        console.warn(`Page ${page.id} skipped because it has no title.`);
        continue;
      }

      const workItem: Work = {
        id: page.id,
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

  } catch (error: unknown) {
    console.error("Error fetching from Notion:", error);
    let errorMessage = 'Failed to fetch data from Notion';
    let status = 500;
    if (error instanceof APIResponseError) {
      errorMessage = error.message;
      status = error.status;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: status });
  }
}