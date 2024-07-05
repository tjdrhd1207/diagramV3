import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("PROJECT_PAGES")
export class ProjectPages {
  @PrimaryGeneratedColumn({name:"project_Id"})
  projectID: string | undefined;

  @Column({ type: "varchar", name:"page_File_Name" })
  flowNames: string | undefined;

  @Column({ type: "varchar", name:"page_Source" })
  flowSource: string | undefined;

  @Column({ type: "varchar", name:"current_Accessor" })
  current_Accessor: string | undefined;

  @Column({ type: "varchar", name:"start" })
  start: string | undefined;

  @Column({ type: "varchar", name:"tag" })
  tag: string | undefined;

  @Column({ type: "varchar", name:"create_Date" })
  createDate: string | undefined;

  @Column({ type: "varchar", name:"create_Time" })
  createTime: string | undefined;

  @Column({ type: "varchar", name:"update_Date" })
  updateDate: string | undefined;

  @Column({ type: "varchar", name:"update_Time" })
  updateTime: string | undefined;

  // 나머지 필드 정의

  constructor (PROJECT_ID?: string, FLOWNAMES?: string, FLOWSOURCE?: string, CURRENT_ACCESSOR?: string,  START?: string, TAG?: string, CREATE_DATE?: string, CREATE_TIME?: string, UPDATE_DATE?: string, UPDATE_TIME?: string){
    if (PROJECT_ID) this.projectID = PROJECT_ID;
    if (FLOWNAMES) this.flowNames = FLOWNAMES;
    if (FLOWSOURCE) this.flowSource = FLOWSOURCE;
    if (CURRENT_ACCESSOR) this.current_Accessor = CURRENT_ACCESSOR;
    if (START) this.start = START;
    if (TAG) this.tag = TAG;
    if (CREATE_DATE) this.createDate = CREATE_DATE;
    if (CREATE_TIME) this.createTime = CREATE_TIME;
    if (UPDATE_DATE) this.updateDate = UPDATE_DATE;
    if (UPDATE_TIME) this.updateTime = UPDATE_TIME;
  }
}