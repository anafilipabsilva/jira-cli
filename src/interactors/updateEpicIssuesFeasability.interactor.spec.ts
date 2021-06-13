import { JiraGateway } from 'src/gateways/jira.gateway';
import { UpdateEpicIssuesFeasabilityInteractor } from './updateEpicIssuesFeasability.interactor';

describe('UpdateEpicIssuesFeasabilityInteractor', () => {
  let interactor: UpdateEpicIssuesFeasabilityInteractor;

  const mockUpdateEpicIssuesFeasability = jest.fn();
  const jiraGatewayMock = ({
    updateEpicIssuesFeasability: mockUpdateEpicIssuesFeasability,
  } as unknown) as JiraGateway;

  beforeEach(async () => {
    mockUpdateEpicIssuesFeasability.mockClear();
    interactor = new UpdateEpicIssuesFeasabilityInteractor(jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    it('should call the update epic issues feasability method', async () => {
      await interactor.call('project-id', 'release');

      expect(mockUpdateEpicIssuesFeasability.mock.calls.length).toBe(1);
      expect(mockUpdateEpicIssuesFeasability.mock.calls[0]).toEqual([
        'project-id',
        'release',
      ]);
    });

    describe('and there are issues to update', () => {
      it('should return the list of updated issues', async () => {
        mockUpdateEpicIssuesFeasability.mockImplementationOnce(() => [
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
        mockUpdateEpicIssuesFeasability.mockImplementationOnce(() => []);
        const result = await interactor.call('project-id', 'release');

        expect(result).toEqual([]);
      });
    });
  });
});
