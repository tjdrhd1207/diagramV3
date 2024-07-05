import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProjectPages {
  @PrimaryGeneratedColumn({name:"PROJECT_ID"})
  projectID: string | undefined;

  @Column({ type: "varchar", name:"FLOWNAMES" })
  flowNames: string | undefined;

  @Column({ type: "varchar", name:"FLOWSOURCE" })
  flowSource: string | undefined;

  @Column({ type: "varchar", name:"CURRENTACCESSOR" })
  current_Accessor: string | undefined;

  @Column({ type: "varchar", name:"START" })
  start: string | undefined;

  @Column({ type: "varchar", name:"TAG" })
  tag: string | undefined;

  @Column({ type: "varchar", name: "CREATE_DATE" })
  createDate: string | undefined;

  @Column({ type: "varchar", name: "CREATE_TIME" })
  createTime: string | undefined;

  @Column({ type: "varchar", name: "UPDATE_DATE" })
  updateDate: string | undefined;

  @Column({ type: "varchar", name: "UPDATE_TIME" })
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