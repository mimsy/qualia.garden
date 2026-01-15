<script lang="ts">
	// ABOUTME: Shared header component with navigation.
	// ABOUTME: Shows admin-only links and highlights current page.

	interface Props {
		isAdmin?: boolean;
		currentPath: string;
	}

	let { isAdmin = false, currentPath }: Props = $props();

	function isActive(path: string): boolean {
		return currentPath === path || currentPath.startsWith(path + '/');
	}

	const linkBase = 'px-3 py-2 text-sm rounded-lg transition-colors';
	const linkInactive = 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
	const linkActive = 'text-slate-900 font-medium bg-slate-100';
</script>

<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
	<div class="max-w-6xl mx-auto px-6 py-4">
		<div class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-3 group">
				<img src="/favicon.png" alt="" class="w-9 h-9 transition-transform group-hover:scale-105" />
				<span class="font-semibold text-slate-800 text-lg tracking-tight">Qualia Garden</span>
			</a>
			<nav class="flex items-center gap-1">
				<a href="/questions" class="{linkBase} {isActive('/questions') ? linkActive : linkInactive}"> Questions </a>
				<a href="/models" class="{linkBase} {isActive('/models') ? linkActive : linkInactive}"> Models </a>
				{#if isAdmin}
					<a href="/responses" class="{linkBase} {isActive('/responses') ? linkActive : linkInactive}"> Responses </a>
				{/if}
			</nav>
		</div>
	</div>
</header>
