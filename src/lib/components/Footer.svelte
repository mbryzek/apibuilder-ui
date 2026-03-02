<script lang="ts">
	/**
	 * App Footer Component
	 */

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto border-t border-gray-200">
	<div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
		<div class="flex flex-col sm:flex-row justify-between items-center gap-4">
			<p class="text-ab-gray text-sm">&copy; {currentYear} API Builder</p>
			<div class="text-white">
			</div>

			<!-- Links -->
			<div class="flex items-center gap-6">
				<a href="/doc" class="text-ab-gray hover:text-ab-blue transition-colors text-sm">
					Documentation
				</a>
				<a
					href="https://github.com/apicollective/apibuilder"
					target="_blank"
					rel="noopener noreferrer"
					class="text-ab-gray hover:text-ab-blue transition-colors text-sm"
				>
					GitHub
				</a>
			</div>
		</div>
	</div>
</footer>
