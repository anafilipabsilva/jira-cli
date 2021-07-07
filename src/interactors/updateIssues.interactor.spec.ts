import { JiraGateway } from 'src/gateways/jira.gateway';
import { FileService } from 'src/services/file.service';
import { UpdateIssuesInteractor } from './updateIssues.interactor';

describe('UpdateIssuesInteractor', () => {
  let interactor: UpdateIssuesInteractor;

  const mockUpdateIssue = jest.fn();
  const jiraGatewayMock = ({
    updateIssue: mockUpdateIssue,
  } as unknown) as JiraGateway;

  const mockReadFile = jest.fn();
  const fileServiceMock = ({
    readFile: mockReadFile,
  } as unknown) as FileService;

  beforeEach(async () => {
    mockUpdateIssue.mockClear();
    mockReadFile.mockClear();
    interactor = new UpdateIssuesInteractor(fileServiceMock, jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    it('should call the read file method', async () => {
      mockReadFile.mockImplementationOnce(() => []);
      await interactor.call('/filepath');

      expect(mockReadFile.mock.calls.length).toBe(1);
      expect(mockReadFile.mock.calls[0]).toEqual(['/filepath']);
    });

    describe('when the file has issues', () => {
      describe('and the issues have no errors', () => {
        beforeEach(async () => {
          mockReadFile.mockImplementation(() => [
            {
              id: 'INT-123',
              summary: 'New name',
            },
            {
              id: 'INT-456',
              description: 'This is a new description',
            },
          ]);
        });

        it('should call the update issue', async () => {
          await interactor.call('/filepath');

          expect(mockUpdateIssue.mock.calls.length).toBe(2);
          expect(mockUpdateIssue.mock.calls[0]).toEqual([
            {
              id: 'INT-123',
              summary: 'New name',
            },
          ]);
          expect(mockUpdateIssue.mock.calls[1]).toEqual([
            {
              id: 'INT-456',
              description: 'This is a new description',
            },
          ]);
        });

        it('should return the list of updated issues', async () => {
          mockUpdateIssue.mockImplementationOnce(() => ({
            id: 'INT-123',
            key: 'Dummy',
            self: 'www.url.com',
          }));
          mockUpdateIssue.mockImplementationOnce(() => ({
            id: 'INT-456',
            key: 'Dummy again',
            self: 'www.url.com',
          }));
          const result = await interactor.call('/filepath');

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

      describe('and the issues have errors', () => {
        beforeEach(async () => {
          mockReadFile.mockImplementation(() => [
            {
              project_key: 'INT',
              issue_type: 'Epic',
              summary: 'This is a test',
            },
            {
              id: 'AP-123',
              issue_type: 'Story',
              description: 'This is a description',
            },
          ]);
        });

        it('should not call the create issue', async () => {
          await expect(interactor.call('/filepath')).rejects.toEqual(
            'The required field id is not provided in the file',
          );
        });
      });
    });

    describe('when the file has no issues', () => {
      it('should not call the update issue', async () => {
        mockReadFile.mockImplementationOnce(() => []);
        await interactor.call('/filepath');

        expect(mockUpdateIssue.mock.calls.length).toBe(0);
      });

      it('should return an empty array', async () => {
        mockReadFile.mockImplementationOnce(() => []);
        const result = await interactor.call('/filepath');

        expect(result).toEqual([]);
      });
    });
  });
});
