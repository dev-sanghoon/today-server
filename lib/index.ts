import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

interface ReqBody {
	content: string;
}

function refinePostBlog(reqBody: ReqBody) {
	const result = { verified: false };

	if (!reqBody) {
		return result;
	}

	if (!reqBody.content) {
		return result;
	}

	const { content } = reqBody;
	Object.assign(result, { content });

	const htmlString = getHtmlParsedMarkdown(content);
	const jsDom = new JSDOM(htmlString);
	const { document } = jsDom.window;

	const titleElem = document.querySelector('h1');
	if (titleElem === null) {
		return result;
	}

	const title = titleElem.textContent;
	if (!title) {
		return result;
	}
	Object.assign(result, { title });

	const boldElems = document.querySelectorAll('strong');
	if (boldElems.length === 0) {
		return result;
	}

	const summaries = Array.from(boldElems).map((elem) => elem.textContent);
	const wrongSummaryItems = summaries.filter((item) => !item);
	if (wrongSummaryItems.length) {
		return result;
	}
	Object.assign(result, { summaries });

	result.verified = true;
	return result;
}

function getPurified(target: string) {
	const window = new JSDOM('').window;
	// @ts-expect-error should be handled later - ts migration should be executed
	const purify = DOMPurify(window);
	return purify.sanitize(target);
}

function getHtmlParsedMarkdown(markdown: string) {
	return getPurified(marked.parse(markdown));
}

export { refinePostBlog, getPurified, getHtmlParsedMarkdown };
