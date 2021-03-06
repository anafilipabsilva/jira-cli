import { JiraGateway } from 'src/gateways/jira.gateway';
import { SearchIssuesInteractor } from './searchIssues.interactor';

describe('SearchIssuesInteractor', () => {
  let interactor: SearchIssuesInteractor;

  const mockSearchIssues = jest.fn();
  const jiraGatewayMock = ({
    searchIssues: mockSearchIssues,
  } as unknown) as JiraGateway;

  beforeEach(async () => {
    mockSearchIssues.mockClear();
    interactor = new SearchIssuesInteractor(jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    describe('and all the arguments are given', () => {
      it('should call the search issues method', async () => {
        await interactor.call(
          'project-id',
          'issue-type',
          'release',
          'status',
          'feasibility',
          'epic-link-id',
          'label',
        );

        expect(mockSearchIssues.mock.calls.length).toBe(1);
        expect(mockSearchIssues.mock.calls[0]).toEqual([
          'project-id',
          'issue-type',
          'release',
          'status',
          'feasibility',
          'epic-link-id',
          'label',
        ]);
      });

      it('should return the list of issues', async () => {
        mockSearchIssues.mockImplementationOnce(() => ({ prop: 'issue-id' }));

        expect(
          await interactor.call('project-id', 'issue-type', 'release'),
        ).toEqual({ prop: 'issue-id' });
      });
    });

    describe('and only two arguments are given', () => {
      it('should call the seatch issues method', async () => {
        await interactor.call('project-id', 'issue-type');

        expect(mockSearchIssues.mock.calls.length).toBe(1);
        expect(mockSearchIssues.mock.calls[0]).toEqual([
          'project-id',
          'issue-type',
          null,
          null,
          null,
          null,
          null,
        ]);
      });

      it('should return the list of issues', async () => {
        mockSearchIssues.mockImplementationOnce(() => ({ prop: 'issue-id' }));

        expect(await interactor.call('project-id', 'issue-type')).toEqual({
          prop: 'issue-id',
        });
      });
    });
  });
});
