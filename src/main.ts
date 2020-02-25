const core = require('@actions/core')
const github = require('@actions/github')
const { getIssueLabels } = require('./functions')
const { getRepoLabels, addLabels } = require('./github')

export async function run() {
  try {
    const token = core.getInput('repo-token', {required: true})
    const ignoreComments = core.getInput('ignore-comments')
    const labelsNotAllowed = core.getInput('labels-not-allowed').split('|').filter(elem => elem !== "")
    const client = new github.GitHub(token)
    const issue = github.context.payload.issue

    console.log('Getting repository labels...')
    const repoLabels: string = await getRepoLabels(client, labelsNotAllowed)
    console.log(`Repository labels found: ${repoLabels.length}`)

    console.log('Reading labels in issue...')
    const issueLabels: string[] = getIssueLabels(issue.body, repoLabels, ignoreComments)
    console.log(`Labels found: ${issueLabels.length}`)
    if (issueLabels.length !== 0 ) {
      console.log('Adding labels to issue...')
      console.log('issue.number:', issue.number)
      console.log('issueLabels:', issueLabels)
      await addLabels(client, issue.number, issueLabels)
      console.log('Done')
    } else {
      console.log('Done')
    }
  } catch (error) {
    console.log('error:', JSON.stringify(error, null, 2))
    core.setFailed(error.message)
  }
}

run()
