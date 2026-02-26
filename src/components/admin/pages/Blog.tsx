"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";

import { can, type PermissionMatrix } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";

export type BlogPost = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	featured_image: string | null;
	is_published: boolean;
	created_at: string;
	updated_at: string;
};

function normalizeSlug(input: string) {
	const s = String(input || "").trim();
	return s
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export default function BlogPage({
	posts,
	status,
	error,
	permissions,
	onRefresh,
	onCreatePost,
	onUpdatePost,
}: {
	posts: BlogPost[];
	status: "idle" | "loading" | "error";
	error: string;
	permissions: PermissionMatrix;
	onRefresh: () => Promise<void>;
	onCreatePost: (payload: {
		title: string;
		slug?: string;
		excerpt?: string | null;
		content?: string;
		featured_image?: string | null;
		is_published?: boolean;
	}) => Promise<BlogPost | null>;
	onUpdatePost: (
		id: string,
		patch: Partial<{
			title: string;
			slug: string;
			excerpt: string | null;
			content: string;
			featured_image: string | null;
			is_published: boolean;
		}>,
	) => Promise<void>;
}) {
	const canEdit = can(permissions, "edit_blog");

	const sorted = useMemo(() => {
		return posts
			.slice()
			.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
	}, [posts]);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = useMemo(() => (selectedId ? posts.find((p) => p.id === selectedId) ?? null : null), [posts, selectedId]);

	const [title, setTitle] = useState<string>("");
	const [slug, setSlug] = useState<string>("");
	const [slugTouched, setSlugTouched] = useState<boolean>(false);
	const [excerpt, setExcerpt] = useState<string>("");
	const [featuredImage, setFeaturedImage] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [isPublished, setIsPublished] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);
	const [saveError, setSaveError] = useState<string>("");

	function resetDraft(from?: BlogPost | null) {
		setSaveError("");
		setSaving(false);
		setTitle(from?.title ?? "");
		setSlug(from?.slug ?? "");
		setSlugTouched(Boolean(from?.slug));
		setExcerpt(from?.excerpt ?? "");
		setFeaturedImage(from?.featured_image ?? "");
		setContent(from?.content ?? "");
		setIsPublished(Boolean(from?.is_published));
	}

	useEffect(() => {
		// If selection disappears after refresh, reset.
		if (selectedId && !selected) {
			setSelectedId(null);
			resetDraft(null);
		}
	}, [selectedId, selected]);

	useEffect(() => {
		if (!selectedId) return;
		resetDraft(selected);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedId]);

	useEffect(() => {
		if (slugTouched) return;
		const next = normalizeSlug(title);
		setSlug(next);
	}, [title, slugTouched]);

	async function onNew() {
		setSelectedId(null);
		setSlugTouched(false);
		resetDraft(null);
	}

	async function onSave() {
		if (!canEdit) return;
		setSaveError("");
		const t = title.trim();
		if (!t) {
			setSaveError("Title is required");
			return;
		}
		const s = normalizeSlug(slug || t);
		if (!s) {
			setSaveError("Slug is required");
			return;
		}

		setSaving(true);
		try {
			if (selectedId) {
				await onUpdatePost(selectedId, {
					title: t,
					slug: s,
					excerpt: excerpt.trim() ? excerpt.trim() : null,
					featured_image: featuredImage.trim() ? featuredImage.trim() : null,
					content,
					is_published: isPublished,
				});
			} else {
				const created = await onCreatePost({
					title: t,
					slug: s,
					excerpt: excerpt.trim() ? excerpt.trim() : null,
					featured_image: featuredImage.trim() ? featuredImage.trim() : null,
					content,
					is_published: isPublished,
				});
				if (created?.id) setSelectedId(created.id);
			}
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
			<Card className="xl:col-span-1">
				<CardHeader>
					<CardTitle>Posts</CardTitle>
					<CardDescription>Create a new post, or edit an existing one.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between gap-2">
						<Button size="sm" variant="ghost" onClick={onRefresh} title="Refresh from backend">
							<RefreshCw size={14} />
							Refresh
						</Button>
						<Button variant="primary" onClick={onNew} disabled={!canEdit}>
							<Plus size={16} />
							New Post
						</Button>
					</div>

					{status === "loading" ? <div className="mt-3 text-sm text-[hsl(var(--muted))]">Loading posts…</div> : null}
					{error ? (
						<div className="mt-3 rounded-xl border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.08)] p-3 text-sm text-[hsl(var(--danger))]">
							{error}
						</div>
					) : null}

					<div className="mt-4 space-y-2">
						{sorted.length === 0 ? (
							<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3 text-sm text-[hsl(var(--muted))]">
								No posts yet.
							</div>
						) : null}

						{sorted.map((p) => {
							const active = p.id === selectedId;
							return (
								<button
									key={p.id}
									onClick={() => setSelectedId(p.id)}
									className={[
										"w-full rounded-xl border p-3 text-left transition",
										active
											? "border-[hsl(var(--secondary)/0.35)] bg-[hsl(var(--secondary)/0.10)]"
											: "border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-2))]",
									].join(" ")}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="truncate font-medium">{p.title}</div>
											<div className="mt-1 truncate text-xs text-[hsl(var(--muted))]">/{p.slug}</div>
										</div>
										<div className="shrink-0">
											<Badge tone={p.is_published ? "green" : "amber"}>{p.is_published ? "Published" : "Draft"}</Badge>
										</div>
									</div>
									<div className="mt-2 text-xs text-[hsl(var(--muted))]">Updated: {formatDateTime(p.updated_at)}</div>
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<Card className="xl:col-span-2">
				<CardHeader>
					<CardTitle>{selectedId ? "Edit Post" : "New Post"}</CardTitle>
					<CardDescription>Write your blog content and publish it when ready.</CardDescription>
				</CardHeader>
				<CardContent>
					{!canEdit ? (
						<div className="mb-4 rounded-xl border border-[hsl(var(--warn)/0.35)] bg-[hsl(var(--warn)/0.10)] p-3 text-sm text-[hsl(var(--text))]">
							You don’t have permission to edit blog posts.
						</div>
					) : null}

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div>
							<label className="text-xs text-[hsl(var(--muted))]">Title</label>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								disabled={!canEdit}
								className="mt-2 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm shadow-[var(--shadow-sm)] outline-none"
								placeholder="e.g. How to Sell Scrap in Pune"
							/>
						</div>
						<div>
							<label className="text-xs text-[hsl(var(--muted))]">Slug</label>
							<input
								value={slug}
								onChange={(e) => {
									setSlugTouched(true);
									setSlug(e.target.value);
								}}
								onBlur={() => setSlug((s) => normalizeSlug(s))}
								disabled={!canEdit}
								className="mt-2 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm shadow-[var(--shadow-sm)] outline-none"
								placeholder="auto-generated-from-title"
							/>
						</div>
					</div>

					<div className="mt-3">
						<label className="text-xs text-[hsl(var(--muted))]">Excerpt (optional)</label>
						<textarea
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							disabled={!canEdit}
							rows={3}
							className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
							placeholder="Short summary for the blog listing…"
						/>
					</div>

					<div className="mt-3">
						<label className="text-xs text-[hsl(var(--muted))]">Featured Image URL (optional)</label>
						<input
							value={featuredImage}
							onChange={(e) => setFeaturedImage(e.target.value)}
							disabled={!canEdit}
							className="mt-2 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm shadow-[var(--shadow-sm)] outline-none"
							placeholder="https://…"
						/>
					</div>

					<div className="mt-3">
						<label className="text-xs text-[hsl(var(--muted))]">Content</label>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							disabled={!canEdit}
							rows={14}
							className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
							placeholder="Write your blog post here…"
						/>
					</div>

					<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={isPublished}
								onChange={(e) => setIsPublished(e.target.checked)}
								disabled={!canEdit}
								className="h-4 w-4"
							/>
							<span>Published</span>
						</label>

						<div className="flex items-center gap-2">
							<Button variant="ghost" onClick={() => resetDraft(selected)} disabled={saving}>
								Reset
							</Button>
							<Button variant="primary" onClick={onSave} disabled={!canEdit || saving}>
								{saving ? "Saving…" : "Save"}
							</Button>
						</div>
					</div>

					{saveError ? (
						<div className="mt-3 rounded-xl border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.08)] p-3 text-sm text-[hsl(var(--danger))]">
							{saveError}
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
