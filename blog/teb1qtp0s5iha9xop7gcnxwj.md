### 마크다운으로 작성된 문서를 웹페이지에 올리기
1. 웹페이지에서 API 요청을 통해 데이터를 받을 것이다.
2. 데이터를 받을 때 어떤 형태로 받아야 하는가?

웹페이지는 HTML 기반이며, markdown은 HTML에서 자동으로 표시되지 않는다.

```js
// on MongoDB
{
    _id: 'xxx',
    title: 'hello world',
    content: '### 아아, 이것은 마크다운이라는 것이다.'
}

// server
그대로 전달

// client with svelte
<script>
import { parser } from markParser;

const data = await get.fromServerAPI('/article/1');
</script>

<div>
{@html parser(data.content)}
```

대략 이런식으로 해야할 듯.