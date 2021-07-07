import { JiraGateway } from 'src/gateways/jira.gateway';
import { UpdateEpicIssuesFeasibilityInteractor } from './updateEpicIssuesFeasibility.interactor';

describe('UpdateEpicIssuesFeasibilityInteractor', () => {
  let interactor: UpdateEpicIssuesFeasibilityInteractor;

  const mockUpdateEpicIssuesFeasibility = jest.fn();
  const jiraGatewayMock = ({
    updateEpicIssuesFeasibility: mockUpdateEpicIssuesFeasibility,
  } as unknown) as JiraGateway;

  beforeEach(async () => {
    mockUpdateEpicIssuesFeasibility.mockClear();
    interactor = new UpdateEpicIssuesFeasibilityInteractor(jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    it('should call the update epic issues feasibility method', async () => {
      await interactor.call('project-id', 'release');

      expect(mockUpdateEpicIssuesFeasibility.mock.calls.length).toBe(1);
      expect(mockUpdateEpicIssuesFeasibility.mock.calls[0]).toEqual([
        'project-id',
        'release',
      ]);
    });

    describe('and there are issues to update', () => {
      it('should return the list of updated issues', async () => {
        mockUpdateEpicIssuesFeasibility.mockImplementationOnce(() => [
          {
            id: 'INT-123',
            key: 'Dummy',
            self: 'www.url.com',
          },
          {
            id: 'INT-456',
            key: 'Dummy again',
            self: 'www.url.com',
          },
        ]);

        const result = await interactor.call('project-id', 'release');

        expect(result).toEqual([
          {
            id: 'INT-123',
            key: 'Dummy',
            self: 'www.url.com',
          },
          {
            id: 'INT-456',
            key: 'Dummy again',
            self: 'www.url.com',
          },
        ]);
      });
    });

    describe('and there are no issues to update', () => {
      it('should return an empty array', async () => {
        mockUpdateEpicIssuesFeasibility.mockImplementationOnce(() => []);
        const result = await interactor.call('project-id', 'release');

        expect(result).toEqual([]);
      });
    });
  });
});
