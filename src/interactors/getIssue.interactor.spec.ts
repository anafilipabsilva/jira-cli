import { JiraGateway } from 'src/gateways/jira.gateway';
import { GetIssueInteractor } from './getIssue.interactor';

describe('GetIssueInteractor', () => {
  let interactor: GetIssueInteractor;

  const mockGetIssue = jest.fn();
  const jiraGatewayMock = ({
    getIssue: mockGetIssue,
  } as unknown) as JiraGateway;

  beforeEach(async () => {
    mockGetIssue.mockClear();
    interactor = new GetIssueInteractor(jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    it('should call the get issue method', async () => {
      await interactor.call('issue-id');

      expect(mockGetIssue.mock.calls.length).toBe(1);
      expect(mockGetIssue.mock.calls[0]).toEqual(['issue-id']);
    });

    it('should return the issue', async () => {
      mockGetIssue.mockImplementationOnce((issueId) => ({ prop: issueId }));

      expect(await interactor.call('issue-id')).toEqual({ prop: 'issue-id' });
    });
  });
});
