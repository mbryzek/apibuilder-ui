<svelte:head>
	<title>API Tokens - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">API Tokens</h1>

	<p class="text-ab-dark-blue mb-4">
		API Builder provides a complete REST API to all of the data - and
		everything you see in the user interface is displayed by
		interacting directly with the API. By default, all public
		information is available via the API:
	</p>

	<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-6">{@html `<code>curl https://api.apibuilder.io/organizations

  [
    {
      "guid": "480d042d-2bf9-47f3-a743-204a05eaa319",
      "key": "apicollective",
      "name": "API Collective",
      "namespace": "io",
      "visibility": "public",
      "domains": [],
      "audit": {
        "created_at": "2017-06-24T14:25:01.918Z",
        "created_by": {
          "guid": "b0c45ffe-8ab2-4bbd-8742-8d16adbd1dc4"
        },
        "updated_at": "2017-06-24T14:58:07.459Z",
        "updated_by": {
          "guid": "b0c45ffe-8ab2-4bbd-8742-8d16adbd1dc4"
        }
      }
    },
    ...
  ]</code>`}</pre>

	<p class="text-ab-dark-blue mb-4">
		Authentication is
		via <a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue">API tokens</a> and
		is needed if you have any data in API Builder that is not public.
	</p>

	<p class="text-ab-dark-blue mb-4">
		Once you have your API token, verify that it is valid:
	</p>

	<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>curl -u API_TOKEN: https://api.apibuilder.io/&lt;your organization id&gt;</code>`}</pre>

	<p class="text-ab-dark-blue mb-6">
		You should now see your private applications in the response.
	</p>

	<p class="text-ab-dark-blue">
		Full documentation of the API Builder API is available online at
		<a href="/apicollective/apibuilder-api" class="text-ab-blue hover:text-ab-dark-blue">apicollective/apibuilder-api</a>.
	</p>
</div>
