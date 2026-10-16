Task A :
Query For Leadership board
Select a.name, a.category, 
ROUND(AVG(r.score), 2) AS average_score,
COUNT(r.id) AS total_review_count,
COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) AS total_completed_booking_count
from artist a
INNER JOIN reviews r ON r.artist_id = a.id
INNER JOIN bookings b ON r.artist_id = a.id
WHERE r.created_at >= NOW() - INTERVAL 90 DAY
GROUP BY a.id, a.name
HAVING COUNT(r.id) >= 5
ORDER BY average_score DESC, total_completed_booking_count DESC
LIMIT 10;

Which indexes would you add to keep this query fast as the reviews table grows? Why those
specifically?
-> I will index created_at, artist_id and rating
1. created_at because the query filters the row within the daterange
2. artist_id as it filter the row and provide the artist information
3. rating it include calculation so database donot need to read each row for rating statistic from the table

At very large scale (tens of millions of rows), what approach would you take to avoid running
this query on every request?
-> I will donot calculate total average rating, total review and total completed review on each api call,
rather then that if will trigger calculation at particular period of time like in every 12 hrs and store that calculation in a table will be name as artist_leadership table and also make api if user want fresh data will call that api and get the top artist which will be name as syncArtistLeadership.

Task B :
1. For field hourly_rate in table artists and amount in table bookings, Float datatype has been used instead of Decimal, as float can cause rouding calculation error.
2. status field in table booking need to be an ENUM datatype where we can told database that it will only this type of value like pending, in-progress, completed, confirmed and cacelled instead if varchar where it will take any value
3. Foreign Key constriant is missing in each table for field artist_id, client_id for booking table and booking_id and artist id in review table
4. Index is missing in each table for field which have foreign key and field which commonly queried during calculation or which will be used while query, mysql automatically indexes foreign key but indexes may still be needed for mostly used query pattern.
5. Missing NOT NULL and by default value constraint in field like name, category and hourly_rate on table artists, artist_id, client_id, amount, eveny_start, event_end in table booking and status field must have default value to pending and currency field also need to add with default value to USD, same for table reviews table field like booking_id, artist_id and score should add NOT NULL constraint.