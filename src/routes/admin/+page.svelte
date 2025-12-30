<script lang="ts">
	// ABOUTME: Admin dashboard showing overview stats.
	// ABOUTME: Quick links to questions, models, and recent polls.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Admin - Qualia Garden</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Dashboard</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-gray-500 text-sm font-medium">Questions</h2>
		<p class="text-3xl font-bold mt-2">{data.stats.questions}</p>
		<a href="/questions" class="text-blue-600 text-sm mt-2 inline-block hover:underline">
			Manage questions →
		</a>
	</div>

	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-gray-500 text-sm font-medium">Models</h2>
		<p class="text-3xl font-bold mt-2">{data.stats.models}</p>
		<a href="/admin/models" class="text-blue-600 text-sm mt-2 inline-block hover:underline">
			Manage models →
		</a>
	</div>

	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-gray-500 text-sm font-medium">Completed Polls</h2>
		<p class="text-3xl font-bold mt-2">{data.stats.completedPolls}</p>
		<a href="/admin/polls" class="text-blue-600 text-sm mt-2 inline-block hover:underline">
			View polls →
		</a>
	</div>
</div>

<div class="bg-white rounded-lg shadow p-6">
	<h2 class="font-bold mb-4">Quick Actions</h2>
	<div class="flex gap-4">
		<a
			href="/questions/new"
			class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
		>
			Create Question
		</a>
		<a href="/admin/polls/trigger" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
			Trigger Poll
		</a>
	</div>
</div>
