// Mock HTML fixtures for testing crawler functions

export const mockThreadPageHtml = `
<!DOCTYPE html>
<html>
<head><title>Thread</title></head>
<body>
<table class="forumTable">
  <tr>
    <td colspan="100">Page Header</td>
  </tr>
  <tr>
    <td class="content-container">
      <div class="content">First post content here</div>
    </td>
    <td class="posted-by">
      <div class="profile-link"><a href="/profile/user1">GGG_Staff</a></div>
      <div class="post_date">2024-02-10 10:30:00</div>
    </td>
    <td><div class="post_anchor" id="12345"></div></td>
  </tr>
  <tr>
    <td class="content-container">
      <div class="content">Second post content here</div>
    </td>
    <td class="posted-by">
      <div class="profile-link"><a href="/profile/user2">Player123</a></div>
      <div class="post_date">2024-02-10 11:00:00</div>
    </td>
    <td><div class="post_anchor" id="67890"></div></td>
  </tr>
</table>
<div class="pagination">
  <a class="current" href="/forum/view-thread/123/page/1">1</a>
  <a href="/forum/view-thread/123/page/2">2</a>
  <a href="/forum/view-thread/123/page/3">3</a>
  <span class="separator">…</span>
  <a href="/forum/view-thread/123/page/52">52</a>
  <a href="/forum/view-thread/123/page/2">Next</a>
</div>
</body>
</html>
`

export const mockCategoryPageHtml = `
<!DOCTYPE html>
<html>
<head><title>Category</title></head>
<body>
<table>
  <tbody>
    <tr>
      <td class="thread">
        <div class="thread_title">
          <div class="title">
            <a href="/forum/view-thread/3912208">2.0.0 Released</a>
          </div>
        </div>
      </td>
      <td class="views"><span>1250</span></td>
    </tr>
    <tr>
      <td class="thread">
        <div class="thread_title">
          <div class="title">
            <a href="/forum/view-thread/3910000">New Features Discussion</a>
          </div>
        </div>
      </td>
      <td class="views"><span>450</span></td>
    </tr>
  </tbody>
</table>
<div class="pagination">
  <a class="current" href="/forum/view-forum/news/page/1">1</a>
  <a href="/forum/view-forum/news/page/2">2</a>
  <a href="/forum/view-forum/news/page/3">3</a>
  <a href="/forum/view-forum/news/page/2">Next</a>
</div>
</body>
</html>
`

export const mockLastPageHtml = `
<!DOCTYPE html>
<html>
<head><title>Thread Last Page</title></head>
<body>
<table class="forumTable">
  <tr>
    <td class="content-container">
      <div class="content">Last page post</div>
    </td>
    <td class="posted-by">
      <div class="profile-link"><a href="/profile/user3">LastPoster</a></div>
      <div class="post_date">2024-02-10 15:00:00</div>
    </td>
    <td><div class="post_anchor" id="99999"></div></td>
  </tr>
</table>
<div class="pagination">
  <a href="/forum/view-thread/123/page/1">Previous</a>
  <a class="current" href="/forum/view-thread/123/page/52">52</a>
</div>
</body>
</html>
`
