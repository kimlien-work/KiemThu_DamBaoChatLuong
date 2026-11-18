import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminStats } from "@/lib/admin-queries";

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export async function GET(request: NextRequest) {
  try {
    const from = request.nextUrl.searchParams.get("from")?.trim();
    const to = request.nextUrl.searchParams.get("to")?.trim();

    if ((from && !to) || (!from && to)) {
      return NextResponse.json(
        { error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." },
        { status: 400 }
      );
    }

    if (from && to) {
      const fromDate = parseIsoDate(from);
      const toDate = parseIsoDate(to);

      if (!fromDate || !toDate) {
        return NextResponse.json({ error: "Khoảng thời gian không hợp lệ." }, { status: 400 });
      }
      if (fromDate > toDate) {
        return NextResponse.json({ error: "Ngày bắt đầu phải trước ngày kết thúc." }, { status: 400 });
      }

      const numberOfDays = (toDate.getTime() - fromDate.getTime()) / 86400000;
      if (numberOfDays > 30) {
        return NextResponse.json(
          { error: "Khoảng thời gian thống kê doanh thu tối đa 31 ngày." },
          { status: 400 }
        );
      }
    }

    const stats = await getAdminStats(from || undefined, to || undefined);
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
