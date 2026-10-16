1. What are the two most likely causes? What would you check first to confirm your diagnosis?
-> I will check end point is not doing full table scan as indexes is missing, if indexed is missing then database scan table row by row to find an artist due which sorting and filtering also become expensive as it first search, sort and filter whole table and then sort, and filter on basis of that.
-> I will check how pagination is implemented. If it is using Offset, I will replace it with cursor-based pagination, as Offset can be slow for large datasets because it has to scan and skip rows before fetching the required data. Cursor-based pagination makes this more efficient by fetching records from where the previous request ended.

2. What is your 48-hour fix? One or two concrete changes that reduce the load immediately without a full rewrite.
-> I will optimize the queries and add indexes, will add composite indexes based on search and sorting, select on required column instead of calling *, will optimize join and add cursor based pagination.
-> I will implement Redis to cache frequently search result this reduced repeated database query.

3. What is the long-term fix? The right architectural solution, and the trade-off you are accepting by choosing it.
-> I will implement a scalable search engine such as OpenSearch or ElasticSearch. Artist data would need to indexed and sync data based on event or background jobs while MySql will remain the source of truth. The search engine will handle the search, sorting and filtering the request which reduces some pressure form mysql.
-> The trade-off will come as it increase implementation and opreational complexity, sync delay and data consistency. However, it provide better search preformance and scalabilty while reduncing load on mysql.