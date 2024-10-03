import pprint

import requests

from llmwrapper import LLMWrapper

# Global LLM prompt template with skills information
# Updated global LLM summary prompt
LLM_SUMMARY_PROMPT = """
Summarize the following {content_type} with short, direct sentences. Do not use bullet points or verbosity.
Keep each sentence on a new line and specific to the task. For example:
- "created backend routing with django"
- "implemented JS calls to API on the front-end"
- "fixed bug in user authentication flow"
Make sure each line is in this format: action + technology used + short description of what was done.

For code changes, additionally specify the skills involved. For example:
- "refactored authentication module using Django to enhance security"
- "optimized API endpoints with Node.js for faster response times"
- "integrated React components with Redux for state management"

Summarize the following {content_type}:
{content}
"""


# System prompt specific for GitHub wrapper
# Global system prompt for GitHubAPIWrapper
GITHUB_SYSTEM_PROMPT = """
You are an assistant specifically designed to summarize GitHub repository data. Your tasks include summarizing commits, pull requests, issues, and code changes. Ensure that each summary is concise, direct, and standardized, using single-line sentences without verbosity or bullet points.
"""



class GitHubAPIWrapper:
    """
    A unified API wrapper to interact with the GitHub REST API, handling core GitHub functionalities like
    fetching commits, pull requests, issues, and organization information.
    Supports multiple modes of instantiation (e.g., repository URL, GitHub username, organization name).
    """

    BASE_URL = "https://api.github.com"

    def __init__(self, auth_token=None, username=None, repo_name=None, org_name=None, llm_wrapper=None):
        """
        Initializes the GitHub API wrapper. Users can specify the username, repo name, or organization name.
        :param auth_token: GitHub API token for authentication (optional, recommended for higher rate limits)
        :param username: GitHub username (for user-based queries)
        :param repo_name: Repository name (for repo-based queries)
        :param org_name: Organization name (for organization-wide queries)
        :param llm_wrapper: Optional LLMWrapper instance to summarize data.
        """
        self.auth_token = auth_token
        self.username = username
        self.repo_name = repo_name
        self.org_name = org_name
        self.llm_wrapper = llm_wrapper

        if not (username or repo_name or org_name):
            raise ValueError("At least one of username, repo_name, or org_name must be provided.")

        self.headers = {
            "Authorization": f"token {self.auth_token}" if self.auth_token else None,
            "Accept": "application/vnd.github.v3+json"
        }

    def _get(self, url, params=None):
        """
        Internal method to send GET requests to the GitHub API.
        :param url: The API URL to fetch data from.
        :param params: Additional query parameters (optional).
        :return: Parsed JSON response.
        """
        import requests
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"GitHub API request failed: {response.status_code} {response.text}")

    def get_commits(self, branch="main", n=5, summarize=False):
        """
        Fetches the latest commits from the specified repository branch.
        :param branch: The branch to fetch commits from (default is 'main').
        :param n: Number of latest commits to retrieve (default is 5).
        :param summarize: Boolean to indicate whether to summarize the commits using LLM.
        :return: List of commits or summarized commits (if summarize=True).
        """
        if not self.repo_name or not self.username:
            raise ValueError("Both username and repo_name must be provided to fetch commits.")

        url = f"{self.BASE_URL}/repos/{self.username}/{self.repo_name}/commits"
        params = {"sha": branch, "per_page": n}
        commits = self._get(url, params)

        if summarize and self.llm_wrapper:
            commit_messages = [commit["commit"]["message"] for commit in commits]
            commits_content = "\n".join(commit_messages)
            prompt = LLM_SUMMARY_PROMPT.format(content_type="commits", content=commits_content)
            summary = self.llm_wrapper.summarize(prompt)
            return summary

        return commits

    def get_pull_requests(self, state="open", summarize=False):
        """
        Fetches the list of pull requests from the specified repository.
        :param state: The state of the pull requests (e.g., 'open', 'closed', 'all'). Default is 'open'.
        :param summarize: Boolean to indicate whether to summarize the pull requests using LLM.
        :return: List of pull requests or summarized pull requests (if summarize=True).
        """
        if not self.repo_name or not self.username:
            raise ValueError("Both username and repo_name must be provided to fetch pull requests.")

        url = f"{self.BASE_URL}/repos/{self.username}/{self.repo_name}/pulls"
        params = {"state": state}
        pulls = self._get(url, params)

        if summarize and self.llm_wrapper:
            pull_messages = [f"PR#{pull['number']}: {pull['title']}" for pull in pulls]
            pulls_content = "\n".join(pull_messages)
            prompt = LLM_SUMMARY_PROMPT.format(content_type="pull requests", content=pulls_content)
            summary = self.llm_wrapper.summarize(prompt)
            return summary

        return pulls

    def get_issues(self, state="open", summarize=False):
        """
        Fetches the list of issues from the specified repository.
        :param state: The state of the issues (e.g., 'open', 'closed', 'all'). Default is 'open'.
        :param summarize: Boolean to indicate whether to summarize the issues using LLM.
        :return: List of issues or summarized issues (if summarize=True).
        """
        if not self.repo_name or not self.username:
            raise ValueError("Both username and repo_name must be provided to fetch issues.")

        url = f"{self.BASE_URL}/repos/{self.username}/{self.repo_name}/issues"
        params = {"state": state}
        issues = self._get(url, params)

        if summarize and self.llm_wrapper:
            issue_messages = [f"Issue#{issue['number']}: {issue['title']}" for issue in issues]
            issues_content = "\n".join(issue_messages)
            prompt = LLM_SUMMARY_PROMPT.format(content_type="issues", content=issues_content)
            summary = self.llm_wrapper.summarize(prompt)
            return summary

        return issues

    def get_org_repos(self, summarize=False):
        """
        Fetches the list of repositories for the specified organization.
        :param summarize: Boolean to indicate whether to summarize the repositories using LLM.
        :return: List of organization repositories or summarized repositories (if summarize=True).
        """
        if not self.org_name:
            raise ValueError("Organization name must be provided to fetch organization repositories.")

        url = f"{self.BASE_URL}/orgs/{self.org_name}/repos"
        repos = self._get(url)

        if summarize and self.llm_wrapper:
            repo_names = [f"Repo: {repo['name']}" for repo in repos]
            repos_content = "\n".join(repo_names)
            prompt = LLM_SUMMARY_PROMPT.format(content_type="repositories", content=repos_content)
            summary = self.llm_wrapper.summarize(prompt)
            return summary

        return repos

    def summarize_patch_files(self, commit_sha, summarize=True):
        """
        Fetches the patch file for a specific commit and summarizes the code changes using the LLM for each file changed.
        Throws an error if token size exceeds 6000.

        :param commit_sha: The SHA identifier of the commit to fetch the patch for.
        :param summarize: Boolean to indicate whether to summarize the patch using LLM.
        :return: Summary of the code changes or the raw patch file content (if summarize=False).
        """
        if not self.repo_name or not self.username:
            raise ValueError("Both username and repo_name must be provided to fetch patch files.")

        # Fetch the commit details
        commit_url = f"{self.BASE_URL}/repos/{self.username}/{self.repo_name}/commits/{commit_sha}"
        commit_data = self._get(commit_url)

        # Check for files changed in the commit
        files_changed = commit_data.get("files", [])
        summaries = []

        for file in files_changed:
            # Accumulate patch content for each file
            patch_content = file.get("patch", "")

            if not patch_content:
                continue

            if summarize and self.llm_wrapper:
                prompt = f"""
                Summarize the following code changes with short, direct sentences. Do not use bullet points or verbosity.
                Each sentence should specify the action taken, the technology or tool used, and the skill demonstrated.
                Example:
                - "refactored authentication module using Django to enhance security"
                - "optimized API endpoints with Node.js for faster response times"
                - "integrated React components with Redux for state management"

                Code Changes for file {file['filename']}:
                {patch_content}
                """

                # Check the token size before sending the request
                token_count = len(prompt.split())
                if token_count > 6000:
                    raise ValueError(f"Token count {token_count} exceeds the 6000 limit for file: {file['filename']}")

                # Summarize the patch content
                summary = self.llm_wrapper.summarize(prompt)
                summaries.append(f"File: {file['filename']}\nSummary:\n{summary.strip()}")

        return "\n\n".join(summaries) if summaries else "No patch content found to summarize."


if __name__ == "__main__":
    # Initialize the LLMWrapper with a system prompt and an API key for Cerebras
    llm = LLMWrapper(system_prompt=GITHUB_SYSTEM_PROMPT)

    # Initialize the GitHubAPIWrapper with your GitHub username and one of your repositories
    github_token = "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"  # Replace with your GitHub token
    repo_name = "TravelPlanner_llama"  # Replace with the repository you want to analyze
    username = "themoonwalker1"  # Your GitHub username

    github_api = GitHubAPIWrapper(auth_token=github_token, username=username, repo_name=repo_name, llm_wrapper=llm)


    # Fetch the 5 most recent commits
    commits = github_api.get_commits(n=5)

    # Fetch and summarize the patch files for each commit
    for commit in commits:
        commit_sha = commit["sha"]
        print(f"Summarizing patch file for commit {commit_sha}:")
        patch_summary = github_api.summarize_patch_files(commit_sha)
        print(patch_summary)
