import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string;
  uploadDate: string;
  views: number;
  userReports: number;
  priority: 'high' | 'medium' | 'low';
}

const ContentList = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [uploadDateFilter, setUploadDateFilter] = useState('all');
  const [viewsFilter, setViewsFilter] = useState('all');

  const contentItems: ContentItem[] = [
    {
      id: '#67890',
      title: 'Adult Content Video - Flagged for Review',
      uploadDate: 'Jan 15, 2024',
      views: 2156,
      userReports: 8,
      priority: 'high'
    },
    {
      id: '#77889',
      title: 'Cooking Tutorial - Italian Pasta',
      uploadDate: 'Jan 11, 2024',
      views: 1685,
      userReports: 0,
      priority: 'medium'
    },
    {
      id: '#99001',
      title: 'DIY Home Improvement Tips',
      uploadDate: 'Jan 10, 2024',
      views: 562,
      userReports: 1,
      priority: 'low'
    },
    {
      id: '#55332',
      title: 'Gaming Review - Latest RPG',
      uploadDate: 'Jan 8, 2024',
      views: 789,
      userReports: 7,
      priority: 'high'
    },
    {
      id: '#66445',
      title: 'Tech Review - Smartphone Comparison',
      uploadDate: 'Jan 5, 2024',
      views: 1456,
      userReports: 4,
      priority: 'high'
    },
    {
      id: '#73625',
      title: 'Fitness Workout - Morning Routine',
      uploadDate: 'Jan 3, 2024',
      views: 1534,
      userReports: 1,
      priority: 'low'
    },
    {
      id: '#95613',
      title: 'Music Performance - Live Concert',
      uploadDate: 'Jan 1, 2024',
      views: 2187,
      userReports: 0,
      priority: 'medium'
    },
    {
      id: '#15396',
      title: 'Educational Content - Science Experiment',
      uploadDate: 'Dec 30, 2023',
      views: 1898,
      userReports: 0,
      priority: 'medium'
    },
    {
      id: '#39152',
      title: 'Comedy Sketch - Office Parody',
      uploadDate: 'Dec 28, 2023',
      views: 3247,
      userReports: 6,
      priority: 'medium'
    },
    {
      id: '#52138',
      title: 'Documentary - Environmental Awareness',
      uploadDate: 'Dec 26, 2023',
      views: 987,
      userReports: 1,
      priority: 'high'
    },
    {
      id: '#81749',
      title: 'Travel Vlog - European Adventure',
      uploadDate: 'Dec 25, 2023',
      views: 1342,
      userReports: 2,
      priority: 'low'
    },
    {
      id: '#42617',
      title: 'Product Unboxing - Tech Gadgets',
      uploadDate: 'Dec 24, 2023',
      views: 876,
      userReports: 0,
      priority: 'medium'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>;
      default:
        return null;
    }
  };

  const handleContentClick = (contentId: string) => {
    // Remove the # symbol and navigate with the clean ID
    const cleanId = contentId.replace('#', '');
    navigate(`/content/${cleanId}`);
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isExpanded={sidebarExpanded} 
        onToggle={handleSidebarToggle} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          contentId="Content Management"
          priority="high"
        />

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* Top Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={uploadDateFilter} onValueChange={setUploadDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Upload Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Upload Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewsFilter} onValueChange={setViewsFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Views" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Views</SelectItem>
                  <SelectItem value="high">High Views</SelectItem>
                  <SelectItem value="medium">Medium Views</SelectItem>
                  <SelectItem value="low">Low Views</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add content
              </Button>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Content title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Content ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Upload Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User reports</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item, index) => (
                    <tr 
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleContentClick(item.id)}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{item.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600 font-mono text-sm">{item.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{item.uploadDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-medium">{item.views.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        {item.userReports > 0 ? (
                          <div className="flex items-center gap-1">
                            <Flag className="w-3 h-3 text-red-500" />
                            <span className="text-red-600 font-medium">{item.userReports}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {getPriorityBadge(item.priority)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No content items match your current filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContentList;