<script lang="ts">
	/**
	 * App Footer Component
	 */

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-ab-dark-blue mt-auto">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<div class="flex flex-col md:flex-row justify-between gap-8">
			<!-- Brand -->
			<div class="text-white">
				<p class="text-lg font-bold mb-2">API Builder</p>
				<p class="text-sm text-white/50">API-first development tools</p>
			</div>

			<!-- Links -->
			<div class="flex flex-col sm:flex-row gap-8">
				<div>
					<p class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Resources</p>
					<div class="flex flex-col gap-2">
						<a href="/doc" class="text-white/70 hover:text-white transition-colors text-sm">Documentation</a>
						<a
							href="https://github.com/apicollective/apibuilder"
							target="_blank"
							rel="noopener noreferrer"
							class="text-white/70 hover:text-white transition-colors text-sm"
						>
							GitHub
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="border-t border-white/10 mt-8 pt-6">
			<p class="text-white/40 text-xs">&copy; {currentYear} API Builder. All rights reserved.</p>
		</div>
	</div>
</footer>
