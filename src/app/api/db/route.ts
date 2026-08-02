import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  MOCK_USERS,
  MOCK_TALENTS,
  MOCK_BRANDS,
  MOCK_SKUS,
  MOCK_CAMPAIGNS,
  MOCK_SHIFTS,
  MOCK_TASKS,
  MOCK_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
} from "@/lib/mock-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Helper to ensure data folder and db.json exist
function getDbData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        users: MOCK_USERS,
        talents: MOCK_TALENTS,
        brands: MOCK_BRANDS,
        skus: MOCK_SKUS,
        campaigns: MOCK_CAMPAIGNS,
        shifts: MOCK_SHIFTS,
        tasks: MOCK_TASKS,
        conversations: MOCK_CONVERSATIONS,
        chatMessages: MOCK_CHAT_MESSAGES,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return {
      users: MOCK_USERS,
      talents: MOCK_TALENTS,
      brands: MOCK_BRANDS,
      skus: MOCK_SKUS,
      campaigns: MOCK_CAMPAIGNS,
      shifts: MOCK_SHIFTS,
      tasks: MOCK_TASKS,
      conversations: MOCK_CONVERSATIONS,
      chatMessages: MOCK_CHAT_MESSAGES,
    };
  }
}

function saveDbData(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing db.json:", error);
    return false;
  }
}

// GET handler: load global server database
export async function GET() {
  const data = getDbData();
  return NextResponse.json(data);
}

// POST handler: save or update global server database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentData = getDbData();
    const updatedData = {
      ...currentData,
      ...body,
    };
    saveDbData(updatedData);
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
