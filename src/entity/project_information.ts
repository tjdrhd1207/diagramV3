import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("project_information")
export class ProjectInformation {
  @PrimaryGeneratedColumn({name: "PROJECT_ID"})
  projectID: string | undefined;

  @Column({ type: "int", name: "PROJECT_INDEX" })
  projectIndex: number | undefined;

  @Column({ type: "varchar", name: "WORKSPACE_NAME" })
  workspaceName: string | undefined;

  @Column({ type: "varchar", name: "PROJECT_NAME" })
  projectName: string | undefined;

  @Column({ type: "varchar", name: "PROJECT_DESCRIPTION" })
  projectDescription: string | undefined;

  @Column({ type: "varchar", name: "CREATE_DATE" })
  createDate: string | undefined;

  @Column({ type: "varchar", name: "CREATE_TIME" })
  createTime: string | undefined;

  @Column({ type: "varchar", name: "UPDATE_DATE" })
  updateDate: string | undefined;

  @Column({ type: "varchar", name: "UPDATE_TIME" })
  updateTime: string | undefined;

  constructor(PROJECT_ID?: string, PROJECT_INDEX?: number, WORKSPACE_NAME?: string, PROJECT_NAME?: string, PROJECT_DESCRIPTION?: string, CREATE_DATE?: string, CREATE_TIME?: string, UPDATE_DATE?: string, UPDATE_TIME?: string) {
    if (PROJECT_ID) this.projectID = PROJECT_ID;
    if (PROJECT_INDEX) this.projectIndex = PROJECT_INDEX;
    if (WORKSPACE_NAME) this.workspaceName = WORKSPACE_NAME;
    if (PROJECT_NAME) this.projectName = PROJECT_NAME;
    if (PROJECT_DESCRIPTION) this.projectDescription = PROJECT_DESCRIPTION;
    if (CREATE_DATE) this.createDate = CREATE_DATE;
    if (CREATE_TIME) this.createTime = CREATE_TIME;
    if (UPDATE_DATE) this.updateDate = UPDATE_DATE;
    if (UPDATE_TIME) this.updateTime = UPDATE_TIME;
  }
}