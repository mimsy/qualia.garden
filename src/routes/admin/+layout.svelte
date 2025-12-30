<script lang="ts">
	// ABOUTME: Admin layout with navigation sidebar.
	// ABOUTME: Wraps all admin pages with consistent navigation.

	import type { LayoutData } from './$types';

	let { data, children } = $props<{ data: LayoutData; children: any }>();
</script>

<div class="min-h-screen bg-gray-100">
	<nav class="bg-gray-900 text-white">
		<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-6">
				<a href="/admin" class="font-bold text-lg">Qualia Garden Admin</a>
				<div class="flex gap-4 text-sm">
					<a href="/questions" class="hover:text-gray-300">Questions</a>
					<a href="/admin/models" class="hover:text-gray-300">Models</a>
					<a href="/admin/polls" class="hover:text-gray-300">Polls</a>
				</div>
			</div>
			<div class="text-sm text-gray-400">
				{data.user}
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>
