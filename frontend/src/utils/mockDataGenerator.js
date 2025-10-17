// 模拟数据生成器
// 基于数据库设计生成真实的课程管理系统模拟数据

// 随机数生成辅助函数
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const formatDate = (date) => date.toISOString().split('T')[0];
const formatDateTime = (date) => date.toISOString().replace('T', ' ').slice(0, 19);

// 模拟数据生成器类
class MockDataGenerator {
  constructor() {
    // 基础数据池
    this.names = ['张', '李', '王', '刘', '陈', '杨', '黄', '周', '吴', '徐'];
    this.firstNames = ['伟', '芳', '娜', '秀英', '敏', '静', '强', '磊', '军', '洋'];
    this.courseNames = [
      '高等数学', '线性代数', '概率论', '大学物理', '计算机基础',
      '数据结构', '算法分析', '操作系统', '计算机网络', '数据库原理',
      '程序设计基础', '面向对象编程', '软件工程', '人工智能导论', '机器学习'
    ];
    this.teacherNames = ['张老师', '李老师', '王老师', '刘老师', '陈老师', '杨老师', '黄老师', '周老师'];
    this.classroomNumbers = ['A101', 'A102', 'B201', 'B202', 'C301', 'C302', 'D401', 'D402'];
    this.departments = ['计算机科学', '数学', '物理', '化学', '生物', '历史', '地理', '英语'];
    this.categories = ['必修', '选修', '公共课', '专业课', '实践课'];
    this.levels = ['基础', '中级', '高级', '专家'];
    this.classNames = ['2022级计算机1班', '2022级计算机2班', '2022级数学1班', '2022级物理1班'];
  }

  // 生成随机姓名
  generateName() {
    const lastName = randomElement(this.names);
    const firstName = randomElement(this.firstNames);
    return lastName + firstName;
  }

  // 生成随机手机号
  generatePhone() {
    return '13' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  }

  // 生成随机邮箱
  generateEmail(username) {
    return `${username}@example.com`;
  }

  // 生成学生数据
  generateStudents(count = 50) {
    const students = [];
    for (let i = 1; i <= count; i++) {
      const studentNo = `202200${i.toString().padStart(3, '0')}`;
      const username = `student${i}`;
      const name = this.generateName();
      const gender = randomElement(['男', '女']);
      const birthDate = randomDate(new Date(2000, 0, 1), new Date(2004, 11, 31));
      const phone = this.generatePhone();
      const email = this.generateEmail(username);
      const enrollmentDate = randomDate(new Date(2022, 8, 1), new Date(2022, 8, 30));
      const status = randomElement(['active', 'active', 'active', 'active', 'graduated', 'dropped']);
      
      students.push({
        student_id: i,
        user_id: i + 100, // 假设用户ID从100开始
        student_no: studentNo,
        name: name,
        gender: gender,
        birthday: formatDate(birthDate),
        phone: phone,
        email: email,
        address: `${randomInt(1, 100)}号楼${randomInt(1, 30)}室`,
        enrollment_date: formatDate(enrollmentDate),
        parent_name: this.generateName(),
        parent_phone: this.generatePhone(),
        status: status,
        create_time: formatDateTime(enrollmentDate),
        update_time: formatDateTime(new Date())
      });
    }
    return students;
  }

  // 生成课程数据
  generateCourses(count = 20) {
    const courses = [];
    for (let i = 1; i <= count; i++) {
      const courseName = this.courseNames[i % this.courseNames.length] + (i > this.courseNames.length ? `(${Math.ceil(i / this.courseNames.length)})` : '');
      const totalHours = randomInt(32, 64);
      const credit = Math.floor(totalHours / 16);
      const startDate = randomDate(new Date(2023, 8, 1), new Date(2023, 10, 30));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 4); // 课程持续4个月
      
      courses.push({
        course_id: i,
        course_name: courseName,
        description: `${courseName}课程是${randomElement(this.departments)}专业的重要课程，总课时${totalHours}小时。`,
        credit: credit,
        total_hours: totalHours,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        level: randomElement(this.levels),
        category: randomElement(this.categories),
        target_audience: '本科生',
        teaching_method: '课堂授课+实践',
        status: randomElement(['published', 'published', 'published', 'ended']),
        created_by: randomInt(1, 10),
        create_time: formatDateTime(new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)),
        update_time: formatDateTime(new Date())
      });
    }
    return courses;
  }

  // 生成班级数据
  generateClasses(count = 8) {
    const classes = [];
    for (let i = 1; i <= count; i++) {
      const className = this.classNames[i % this.classNames.length] + (i > this.classNames.length ? i : '');
      const startDate = new Date(2022, 8, 1);
      const endDate = new Date(2026, 6, 30);
      
      classes.push({
        class_id: i,
        class_name: className,
        grade: '2022级',
        head_teacher_id: randomInt(1, 8),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        max_students: 50,
        current_students: randomInt(30, 50),
        status: 'active',
        create_time: formatDateTime(new Date(2022, 7, 1)),
        update_time: formatDateTime(new Date())
      });
    }
    return classes;
  }

  // 生成教师数据
  generateTeachers(count = 15) {
    const teachers = [];
    for (let i = 1; i <= count; i++) {
      const teacherNo = `T${i.toString().padStart(4, '0')}`;
      const name = this.teacherNames[i % this.teacherNames.length] + (i > this.teacherNames.length ? i : '');
      const hireDate = randomDate(new Date(2010, 0, 1), new Date(2022, 11, 31));
      
      teachers.push({
        teacher_id: i,
        user_id: i + 200, // 假设教师用户ID从200开始
        teacher_no: teacherNo,
        name: name,
        gender: randomElement(['男', '女']),
        birthday: formatDate(randomDate(new Date(1970, 0, 1), new Date(1995, 11, 31))),
        phone: this.generatePhone(),
        email: `${name.replace('老师', '')}@university.edu.cn`,
        address: `教师公寓${randomInt(1, 10)}号楼${randomInt(1, 20)}0${randomInt(1, 9)}室`,
        hire_date: formatDate(hireDate),
        position: randomElement(['助教', '讲师', '副教授', '教授']),
        department: randomElement(this.departments),
        qualification: randomElement(['学士', '硕士', '博士']),
        specialty: randomElement(this.courseNames),
        status: randomElement(['active', 'active', 'active', 'suspended']),
        create_time: formatDateTime(hireDate),
        update_time: formatDateTime(new Date())
      });
    }
    return teachers;
  }

  // 生成学生课程关联数据
  generateStudentCourses(students, courses, countPerStudent = 3) {
    const studentCourses = [];
    let id = 1;
    
    students.forEach(student => {
      // 为每个学生随机选择几门课程
      const selectedCourses = [];
      while (selectedCourses.length < countPerStudent) {
        const course = randomElement(courses);
        if (!selectedCourses.includes(course.course_id)) {
          selectedCourses.push(course.course_id);
          const totalHours = course.total_hours;
          
          studentCourses.push({
            id: id++,
            student_id: student.student_id,
            course_id: course.course_id,
            enrollment_date: formatDateTime(randomDate(new Date(2023, 8, 1), new Date(2023, 10, 30))),
            total_hours: totalHours,
            remaining_hours: randomInt(0, totalHours),
            used_hours: totalHours - randomInt(0, totalHours),
            last_deduction_time: formatDateTime(randomDate(new Date(2023, 9, 1), new Date())),
            auto_deduct_flag: 1,
            status: randomElement(['enrolled', 'enrolled', 'enrolled', 'completed'])
          });
        }
      }
    });
    
    return studentCourses;
  }

  // 生成排课数据
  generateSchedules(courses, teachers, classrooms, count = 50) {
    const schedules = [];
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const timeSlots = ['08:00-10:00', '10:10-12:10', '14:00-16:00', '16:10-18:10', '19:00-21:00'];
    
    for (let i = 1; i <= count; i++) {
      const course = randomElement(courses);
      const teacher = randomElement(teachers);
      const classroom = randomElement(classrooms);
      const weekDay = randomElement(weekDays);
      const timeSlot = randomElement(timeSlots);
      
      schedules.push({
        schedule_id: i,
        course_id: course.course_id,
        teacher_id: teacher.teacher_id,
        class_id: randomInt(1, 8),
        classroom_id: classroom.classroom_id,
        start_time: formatDateTime(randomDate(new Date(2023, 10, 1), new Date(2024, 1, 31))),
        end_time: formatDateTime(new Date(new Date().setHours(new Date().getHours() + 2))),
        day_of_week: weekDays.indexOf(weekDay) + 1,
        week_no: randomInt(1, 16),
        total_weeks: randomInt(8, 16),
        hours: 2,
        schedule_type: randomElement(['regular', 'regular', 'regular', 'makeup']),
        attendance_required: 1,
        auto_deduct: 1,
        max_students: 50,
        current_students: randomInt(20, 45),
        status: randomElement(['scheduled', 'completed', 'completed', 'completed']),
        week_day: weekDay,
        time_slot: timeSlot,
        course_name: course.course_name,
        teacher_name: teacher.name,
        room_no: classroom.room_no
      });
    }
    
    return schedules;
  }

  // 生成教室数据
  generateClassrooms(count = 20) {
    const classrooms = [];
    const buildingNames = ['A', 'B', 'C', 'D', 'E'];
    
    for (let i = 1; i <= count; i++) {
      const building = randomElement(buildingNames);
      const floor = randomInt(1, 6);
      const roomNo = `${building}${floor}${i.toString().padStart(2, '0')}`;
      
      classrooms.push({
        classroom_id: i,
        room_no: roomNo,
        capacity: randomInt(30, 100),
        location: `${building}栋${floor}楼${i.toString().padStart(2, '0')}室`,
        equipment: randomElement(['投影仪,白板', '投影仪,白板,电脑', '白板,电脑']),
        floor: floor,
        building: building,
        room_type: randomElement(['classroom', 'lab', 'computer']),
        has_projector: randomInt(0, 1),
        has_whiteboard: 1,
        has_wifi: 1,
        status: 'available',
        last_maintenance_date: formatDate(randomDate(new Date(2023, 1, 1), new Date()))
      });
    }
    
    return classrooms;
  }

  // 生成学生成绩数据
  generateScores(students, courses, countPerStudent = 5) {
    const scores = [];
    const examTypes = ['midterm', 'final', 'quiz', 'assignment'];
    let id = 1;
    
    students.forEach(student => {
      // 为每个学生生成几门课程的成绩
      const selectedCourses = [];
      while (selectedCourses.length < countPerStudent) {
        const course = randomElement(courses);
        if (!selectedCourses.includes(course.course_id)) {
          selectedCourses.push(course.course_id);
          
          // 为每种考试类型生成成绩
          examTypes.forEach(examType => {
            scores.push({
              score_id: id++,
              student_id: student.student_id,
              course_id: course.course_id,
              exam_type: examType,
              score_value: randomFloat(60, 100),
              exam_date: formatDate(randomDate(new Date(2023, 9, 1), new Date())),
              remarks: '',
              created_by: randomInt(1, 15),
              student_name: student.name,
              course_name: course.course_name,
              exam_type_text: examType === 'midterm' ? '期中' : 
                             examType === 'final' ? '期末' : 
                             examType === 'quiz' ? '测验' : '作业'
            });
          });
        }
      }
    });
    
    return scores;
  }

  // 生成完整的学生数据（包含所有相关信息）
  generateStudentData(studentId, students, courses, studentCourses, scores) {
    const student = students.find(s => s.student_id === studentId);
    if (!student) return null;
    
    // 获取学生的课程
    const enrolledCourses = studentCourses.filter(sc => sc.student_id === studentId);
    
    // 计算学习进度
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(sc => sc.status === 'completed').length;
    const ongoingCourses = enrolledCourses.filter(sc => sc.status === 'enrolled').length;
    const totalHours = enrolledCourses.reduce((sum, sc) => sum + sc.total_hours, 0);
    const usedHours = enrolledCourses.reduce((sum, sc) => sum + sc.used_hours, 0);
    const remainingHours = enrolledCourses.reduce((sum, sc) => sum + sc.remaining_hours, 0);
    const progressPercentage = totalHours > 0 ? Math.round((usedHours / totalHours) * 100) : 0;
    
    // 获取学生的成绩
    const studentScores = scores.filter(s => s.student_id === studentId);
    
    // 计算平均分
    const avgScore = studentScores.length > 0 ? 
      parseFloat((studentScores.reduce((sum, s) => sum + s.score_value, 0) / studentScores.length).toFixed(2)) : 0;
    
    // 获取班级课表（模拟数据）
    const classSchedule = enrolledCourses.map((sc, index) => {
      const course = courses.find(c => c.course_id === sc.course_id);
      return {
        id: index + 1,
        courseName: course?.course_name || '未知课程',
        teacherName: randomElement(this.teacherNames),
        time: randomElement(['周一 08:00-10:00', '周二 14:00-16:00', '周三 10:00-12:00', '周四 16:00-18:00', '周五 08:00-10:00']),
        location: randomElement(this.classroomNumbers),
        remainingHours: sc.remaining_hours
      };
    });
    
    return {
      // 基本信息
      basicInfo: {
        studentId: student.student_id,
        studentNo: student.student_no,
        name: student.name,
        gender: student.gender,
        birthday: student.birthday,
        age: Math.floor((new Date() - new Date(student.birthday)) / (1000 * 60 * 60 * 24 * 365)),
        phone: student.phone,
        email: student.email,
        enrollmentDate: student.enrollment_date,
        status: student.status === 'active' ? '在读' : student.status === 'graduated' ? '毕业' : '退学',
        address: student.address,
        parentName: student.parent_name,
        parentPhone: student.parent_phone
      },
      
      // 学习进度
      learningProgress: {
        totalCourses,
        completedCourses,
        ongoingCourses,
        totalHours,
        usedHours,
        remainingHours,
        progressPercentage,
        avgScore
      },
      
      // 课程安排
      classSchedule,
      
      // 课程列表
      courses: enrolledCourses.map(sc => {
        const course = courses.find(c => c.course_id === sc.course_id);
        return {
          courseId: course?.course_id,
          courseName: course?.course_name,
          credit: course?.credit,
          totalHours: sc.total_hours,
          usedHours: sc.used_hours,
          remainingHours: sc.remaining_hours,
          status: sc.status === 'enrolled' ? '进行中' : '已完成',
          enrollmentDate: sc.enrollment_date
        };
      }),
      
      // 成绩记录
      scores: studentScores
    };
  }

  // 生成完整的模拟数据集
  generateCompleteData() {
    const students = this.generateStudents(30);
    const courses = this.generateCourses(15);
    const teachers = this.generateTeachers(10);
    const classrooms = this.generateClassrooms(15);
    const classes = this.generateClasses(5);
    const studentCourses = this.generateStudentCourses(students, courses);
    const schedules = this.generateSchedules(courses, teachers, classrooms);
    const scores = this.generateScores(students, courses);
    
    // 为student1用户生成详细数据
    const student1Data = this.generateStudentData(1, students, courses, studentCourses, scores);
    
    return {
      students,
      courses,
      teachers,
      classrooms,
      classes,
      studentCourses,
      schedules,
      scores,
      student1Data
    };
  }
}

// 导出模拟数据生成器实例
export default new MockDataGenerator();