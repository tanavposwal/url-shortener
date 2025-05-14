# System Design

## Shorten

- Receives a URL as a POST request
- Generates a unique short ID
- Stores the mapping in a database
- Returns the short URL

## Redirect

- Receives a short ID as a GET request
- Retrieves the original URL from the database + caches layer in server and in client
- Redirects the user to the original URL

## Link Schema

```
shortId: string
url: string
title: string
favicon: string
id: uuid
createdAt: DateTime
count: number
```
