import { JiraGateway } from 'src/gateways/jira.gateway';
import { FileService } from 'src/services/file.service';
import { CreateIssuesInteractor } from './createIssues.interactor';

describe('CreateIssuesInteractor', () => {
  let interactor: CreateIssuesInteractor;

  const mockCreateIssue = jest.fn();
  const jiraGatewayMock = ({
    createIssue: mockCreateIssue,
  } as unknown) as JiraGateway;

  const mockReadFile = jest.fn();
  const fileServiceMock = ({
    readFile: mockReadFile,
  } as unknown) as FileService;

  beforeEach(async () => {
    mockCreateIssue.mockClear();
    mockReadFile.mockClear();
    interactor = new CreateIssuesInteractor(fileServiceMock, jiraGatewayMock);
  });

  describe('when the call method is executed', () => {
    it('should call the read file method', async () => {
      //it is mocking the method to read file and returning an empty array
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
              project_key: 'INT',
              issue_type: 'Epic',
              epic_name: 'Epic for Test',
              summary: 'This is a test',
            },
            {
              project_key: 'AP',
              issue_type: 'Story',
              summary: 'This is a second test',
            },
          ]);
        });

        it('should call the create issue', async () => {
          await interactor.call('/filepath');

          expect(mockCreateIssue.mock.calls.length).toBe(2);
          expect(mockCreateIssue.mock.calls[0]).toEqual([
            {
              project_key: 'INT',
              issue_type: 'Epic',
              epic_name: 'Epic for Test',
              summary: 'This is a test',
            },
          ]);
          expect(mockCreateIssue.mock.calls[1]).toEqual([
            {
              project_key: 'AP',
              issue_type: 'Story',
              summary: 'This is a second test',
            },
          ]);
        });

        it('should return the list of created issues', async () => {
          mockCreateIssue.mockImplementationOnce(() => ({
            id: 'INT-123',
            key: 'Dummy',
            self: 'www.url.com',
          }));
          mockCreateIssue.mockImplementationOnce(() => ({
            id: 'AP-14',
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
              id: 'AP-14',
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
              project_key: 'AP',
              issue_type: 'Story',
              description: 'This is a description',
            },
          ]);
        });

        it('should not call the create issue', async () => {
          await expect(interactor.call('/filepath')).rejects.toEqual(
            'The required field "epic_name" is not provided in the file',
          );
        });
      });
    });

    describe('when the file has no issues', () => {
      it('should not call the create issue', async () => {
        mockReadFile.mockImplementationOnce(() => []);
        await interactor.call('/filepath');

        expect(mockCreateIssue.mock.calls.length).toBe(0);
      });

      it('should return an empty array', async () => {
        mockReadFile.mockImplementationOnce(() => []);
        const result = await interactor.call('/filepath');

        expect(result).toEqual([]);
      });
    });
  });
});
