import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

type LocalizedRouteCopy = Record<
  Locale,
  {
    title: string;
    description: string;
  }
>;

export async function buildLocalizedRouteMetadata({
  copy,
  path,
  tags,
}: {
  copy: LocalizedRouteCopy;
  path: string;
  tags?: string[];
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path,
    title: page.title,
    description: page.description,
    tags,
  });
}
