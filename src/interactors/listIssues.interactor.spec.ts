import { JiraGateway } from 'src/gateways/jira.gateway';
import { ListIssuesInteractor } from './listIssues.interactor';

describe('GetIssueInteractor', () => {
  let interactor: ListIssuesInteractor;

  const mockListIssues = jest.fn();
  const jiraGatewayMock = ({
    listIssues: mockListIssues,
  } as unknown) as JiraGateway;

  beforeEach(async () => {
    mockListIssues.mockClear();
    interactor = new ListIssuesInteractor(jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    describe('and three arguments are given', () => {
      it('should call the list issues method', async () => {
        await interactor.call('project-id', 'issue-type', 'fix-version');

        expect(mockListIssues.mock.calls.length).toBe(1);
        expect(mockListIssues.mock.calls[0]).toEqual([
          'project-id',
          'issue-type',
          'fix-version',
        ]);
      });

      it('should return the list of issues', async () => {
        mockListIssues.mockImplementationOnce(() => ({ prop: 'issue-id' }));

        expect(
          await interactor.call('project-id', 'issue-type', 'fix-version'),
        ).toEqual({ prop: 'issue-id' });
      });
    });

    describe('and only two arguments are given', () => {
      it('should call the list issues method', async () => {
        await interactor.call('project-id', 'issue-type');

        expect(mockListIssues.mock.calls.length).toBe(1);
        expect(mockListIssues.mock.calls[0]).toEqual([
          'project-id',
          'issue-type',
          null,
        ]);
      });

      it('should return the list of issues', async () => {
        mockListIssues.mockImplementationOnce(() => ({ prop: 'issue-id' }));

        expect(await interactor.call('project-id', 'issue-type')).toEqual({
          prop: 'issue-id',
        });
      });
    });
  });
});
