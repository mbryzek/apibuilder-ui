<script lang="ts">
  /**
   * App Footer Component
   */

  const currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto border-t border-gray-200">
  <div class="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p class="text-ab-gray text-sm">&copy; {currentYear} API Builder</p>
      <div class="text-white"></div>

      <!-- Links -->
      <div class="flex items-center gap-6">
        <a href="/doc" class="text-ab-gray hover:text-ab-blue text-sm transition-colors"> Documentation </a>
        <a
          href="https://github.com/apicollective/apibuilder"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ab-gray hover:text-ab-blue text-sm transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</footer>
